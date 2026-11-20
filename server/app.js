// The shop's API. It holds the Razorpay / Instamojo secrets and the template links
// (from .env). Template links are only returned after a payment has been verified.
//
//   POST /api/checkout/order         Razorpay: open an order
//   POST /api/checkout/confirm       Razorpay: verify signature → templates
//   POST /api/instamojo/order        Instamojo: create a payment request → pay URL
//   POST /api/instamojo/confirm      Instamojo: verify payment → templates

import crypto from 'node:crypto'
import express from 'express'
import { CURRENCY, findProduct } from '../src/shop/catalog.js'
import { ContactError, deliverContactNote } from './contactMail.js'

const RAZORPAY_API = 'https://api.razorpay.com/v1'
const INSTAMOJO_API = 'https://api.instamojo.com'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PURPOSE_PREFIX = 'atelier:'

class ShopError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const razorpayKeys = () => {
  const { RAZORPAY_KEY_ID: keyId, RAZORPAY_KEY_SECRET: keySecret } = process.env
  if (!keyId || !keySecret) {
    console.error('Razorpay keys are missing: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env')
    throw new ShopError(503, 'Payments are not available just now. Please try again a little later.')
  }
  return { keyId, keySecret }
}

const instamojoApp = () => {
  const clientId = process.env.INSTAMOJO_CLIENT_ID?.trim()
  const clientSecret = process.env.INSTAMOJO_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    console.error('Instamojo app credentials are missing: set INSTAMOJO_CLIENT_ID and INSTAMOJO_CLIENT_SECRET in .env')
    throw new ShopError(
      503,
      'Instamojo checkout needs a Client ID and Client Secret. In Instamojo open API & Plugins, create an app, and add those two values to .env.',
    )
  }
  return { clientId, clientSecret }
}

let instamojoTokenCache = { token: '', expiresAt: 0 }

const templateUrl = (productId) =>
  process.env[`TEMPLATE_URL_${productId.toUpperCase().replaceAll('-', '_')}`]

const publicShopUrl = (request) => {
  const fromEnv = process.env.SHOP_PUBLIC_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const host = request.get('x-forwarded-host') || request.get('host')
  const proto = request.get('x-forwarded-proto') || request.protocol || 'http'
  return `${proto}://${host}`
}

const razorpay = async (path, init) => {
  const { keyId, keySecret } = razorpayKeys()
  let response
  try {
    response = await fetch(`${RAZORPAY_API}${path}`, {
      ...init,
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    })
  } catch (error) {
    console.error(`Razorpay ${path} could not be reached:`, error.message)
    throw new ShopError(502, 'We could not reach the payment service. Please try again in a moment.')
  }
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error(`Razorpay ${path} answered ${response.status}:`, body.error?.description ?? body)
    throw new ShopError(502, 'The payment service could not complete that. Please try again in a moment.')
  }
  return body
}

const instamojoErrorText = (body) => {
  if (typeof body?.message === 'string') return body.message
  if (typeof body?.error === 'string') return body.error
  if (!body || typeof body !== 'object') return ''
  const first = Object.values(body)
    .flat()
    .find((item) => typeof item === 'string')
  return first || ''
}

const instamojoToken = async () => {
  if (instamojoTokenCache.token && Date.now() < instamojoTokenCache.expiresAt) {
    return instamojoTokenCache.token
  }
  const { clientId, clientSecret } = instamojoApp()
  let response
  try {
    response = await fetch(`${INSTAMOJO_API}/oauth2/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
      signal: AbortSignal.timeout(15000),
    })
  } catch (error) {
    console.error('Instamojo token request could not be reached:', error.message)
    throw new ShopError(502, 'We could not reach Instamojo. Please try again in a moment.')
  }
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.access_token) {
    console.error('Instamojo token request failed:', response.status, instamojoErrorText(body))
    throw new ShopError(
      502,
      'Instamojo rejected the Client ID and Client Secret. Copy a fresh pair from Instamojo → API & Plugins into .env, then restart the shop.',
    )
  }
  const seconds = Number(body.expires_in) || 3600
  instamojoTokenCache = {
    token: body.access_token,
    expiresAt: Date.now() + Math.max(60, seconds - 120) * 1000,
  }
  return instamojoTokenCache.token
}

const instamojo = async (path, init = {}) => {
  const token = await instamojoToken()
  let response
  try {
    response = await fetch(`${INSTAMOJO_API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
        ...init.headers,
      },
      signal: AbortSignal.timeout(15000),
    })
  } catch (error) {
    console.error(`Instamojo ${path} could not be reached:`, error.message)
    throw new ShopError(502, 'We could not reach Instamojo. Please try again in a moment.')
  }
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.success === false) {
    const detail = instamojoErrorText(body)
    console.error(`Instamojo ${path} answered ${response.status}:`, detail || body)
    if (response.status === 401) instamojoTokenCache = { token: '', expiresAt: 0 }
    const denied = response.status === 403 || /permission|not enabled/i.test(detail)
    const notEnabled = /not enabled/i.test(detail)
    throw new ShopError(
      denied ? 403 : 502,
      notEnabled
        ? 'Instamojo says payment requests are not enabled on this account yet. Finish KYC, or email support@instamojo.com and ask them to enable Payment Requests.'
        : denied
          ? 'Instamojo has not allowed this app to create payments yet. Email support@instamojo.com and ask them to enable Payment Requests.'
          : 'Instamojo could not complete that. Please try again in a moment.',
    )
  }
  return body
}

const productsFor = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 20) {
    throw new ShopError(400, 'Your cart is empty.')
  }
  return [...new Set(ids)].map((id) => {
    const product = typeof id === 'string' ? findProduct(id) : undefined
    if (!product) throw new ShopError(400, 'Something in your cart is no longer available.')
    if (!templateUrl(product.id)) {
      console.error(`No template link for "${product.id}": set its TEMPLATE_URL_ line in .env`)
      throw new ShopError(503, `${product.name} is not available just now. Please try again a little later.`)
    }
    return product
  })
}

const deliveryFor = (products) =>
  products.map((product) => ({
    id: product.id,
    name: product.name,
    templateUrl: templateUrl(product.id),
  }))

const createOrder = async (request, response) => {
  const { items, customer } = request.body ?? {}
  const name = typeof customer?.name === 'string' ? customer.name.trim() : ''
  const email = typeof customer?.email === 'string' ? customer.email.trim() : ''
  if (!name || name.length > 80) throw new ShopError(400, 'Please add your name.')
  if (!EMAIL.test(email) || email.length > 120) throw new ShopError(400, 'Please add a valid email.')

  const products = productsFor(items)
  const total = products.reduce((sum, product) => sum + product.price, 0)

  const order = await razorpay('/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount: total * 100,
      currency: CURRENCY,
      receipt: `atelier-${Date.now().toString(36)}`,
      notes: {
        items: products.map((product) => product.id).join(','),
        customer_name: name,
        customer_email: email,
      },
    }),
  })

  response.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: razorpayKeys().keyId,
  })
}

const isGenuine = (orderId, paymentId, signature) => {
  const expected = crypto
    .createHmac('sha256', razorpayKeys().keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest()
  const given = Buffer.from(signature, 'hex')
  return given.length === expected.length && crypto.timingSafeEqual(given, expected)
}

const confirmOrder = async (request, response) => {
  const { orderId, paymentId, signature } = request.body ?? {}
  const wellFormed =
    /^order_\w{1,40}$/.test(orderId) && /^pay_\w{1,40}$/.test(paymentId) && /^[a-f0-9]{64}$/.test(signature)
  if (!wellFormed || !isGenuine(orderId, paymentId, signature)) {
    throw new ShopError(400, 'We could not confirm this payment.')
  }

  const order = await razorpay(`/orders/${orderId}`)
  const products = String(order.notes?.items ?? '')
    .split(',')
    .map(findProduct)
    .filter(Boolean)

  response.json({
    orderId,
    paymentId,
    amount: order.amount / 100,
    items: deliveryFor(products),
  })
}

// Creates a fresh Instamojo checkout for this cart. After payment, Instamojo sends the
// buyer to /thank-you, which verifies the payment before showing the Canva template.
const createInstamojoOrder = async (request, response) => {
  const products = productsFor(request.body?.items)
  const total = products.reduce((sum, product) => sum + product.price, 0)
  const purpose = `${PURPOSE_PREFIX}${products.map((product) => product.id).join('+')}`
  const redirectUrl = `${publicShopUrl(request)}/thank-you`

  const created = await instamojo('/v2/payment_requests/', {
    method: 'POST',
    body: new URLSearchParams({
      purpose,
      amount: total.toFixed(2),
      redirect_url: redirectUrl,
      allow_repeated_payments: 'false',
      send_email: 'false',
      send_sms: 'false',
    }),
  })

  const paymentRequest = created.payment_request || created
  if (!paymentRequest?.longurl || !paymentRequest?.id) {
    console.error('Instamojo create returned no payment URL')
    throw new ShopError(502, 'Instamojo could not open a payment page. Please try again.')
  }

  response.json({
    paymentRequestId: paymentRequest.id,
    paymentUrl: paymentRequest.longurl,
    amount: total,
  })
}

const readInstamojoPayment = async (paymentId, paymentRequestId) => {
  const details = await instamojo(`/v2/payment_requests/${paymentRequestId}/`)
  const paymentRequest = details.payment_request || details
  const payments = Array.isArray(paymentRequest.payments) ? paymentRequest.payments : []
  const payment =
    payments.find((item) => item && (item.id === paymentId || item.payment_id === paymentId)) ||
    payments.at(-1)

  return {
    status: String(payment?.status || paymentRequest.status || '').toLowerCase(),
    amount: Number(payment?.amount ?? paymentRequest.amount),
    purpose: String(paymentRequest.purpose || ''),
    orderId: paymentRequest.id || paymentRequestId,
  }
}

const confirmInstamojoOrder = async (request, response) => {
  const paymentId = String(request.body?.paymentId || '')
  const paymentRequestId = String(request.body?.paymentRequestId || '')
  const fallbackItems = request.body?.items

  if (!/^[\w-]{6,64}$/.test(paymentId) || !/^[\w-]{8,64}$/.test(paymentRequestId)) {
    throw new ShopError(400, 'We could not confirm this payment.')
  }

  const payment = await readInstamojoPayment(paymentId, paymentRequestId)
  if (payment.status !== 'credit' && payment.status !== 'completed') {
    throw new ShopError(400, 'That payment was not completed.')
  }

  let products
  if (payment.purpose.startsWith(PURPOSE_PREFIX)) {
    products = productsFor(payment.purpose.slice(PURPOSE_PREFIX.length).split('+').filter(Boolean))
  } else if (Array.isArray(fallbackItems) && fallbackItems.length) {
    // Dashboard payment-link flow: purpose won't carry our product ids, so the browser
    // reminds us what was being bought and we still check the paid amount.
    products = productsFor(fallbackItems)
  } else {
    throw new ShopError(400, 'We could not match this payment to an order.')
  }

  const expected = products.reduce((sum, product) => sum + product.price, 0)
  if (!Number.isFinite(payment.amount) || Math.abs(payment.amount - expected) > 0.01) {
    throw new ShopError(400, 'The paid amount did not match this order.')
  }

  response.json({
    orderId: payment.orderId,
    paymentId,
    amount: expected,
    items: deliveryFor(products),
  })
}

export function createApiApp() {
  const app = express()
  app.disable('x-powered-by')

  app.use('/api', express.json({ limit: '10kb' }))
  app.post('/api/checkout/order', createOrder)
  app.post('/api/checkout/confirm', confirmOrder)
  app.post('/api/instamojo/order', createInstamojoOrder)
  app.post('/api/instamojo/confirm', confirmInstamojoOrder)
  app.post('/api/contact', async (request, response, next) => {
    try {
      await deliverContactNote(request.body)
      response.json({ ok: true })
    } catch (error) {
      if (error instanceof ContactError) {
        response.status(error.status).json({ error: error.message })
        return
      }
      next(error)
    }
  })
  app.use('/api', (request, response) => response.status(404).json({ error: 'Not found.' }))

  // eslint-disable-next-line no-unused-vars
  app.use((error, request, response, next) => {
    if (error instanceof ShopError) {
      response.status(error.status).json({ error: error.message })
    } else if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large') {
      response.status(400).json({ error: 'That request could not be read.' })
    } else {
      console.error(error)
      response.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
    }
  })

  return app
}
