// After Instamojo marks a payment as Credit, email the buyer once.
// A personal Google Pay transfer does not appear here, so it cannot be confirmed.

import fs from 'node:fs'
import path from 'node:path'
import nodemailer from 'nodemailer'
import { products } from '../src/shop/catalog.js'

const PAYMENTS_URL = 'https://www.instamojo.com/api/1.1/payments/?limit=20'
const STORE = path.resolve('server/data/thanked-payments.json')
const THANKS =
  'Thanks for purchasing the product! We hope you like it just as much as we liked making it for you!'

const templateUrl = (productId) =>
  process.env[`TEMPLATE_URL_${productId.toUpperCase().replaceAll('-', '_')}`]

const productForAmount = (amount) =>
  products.find((product) => Math.abs(product.price - Number(amount)) < 0.01)

const readSent = () => {
  try {
    const stored = JSON.parse(fs.readFileSync(STORE, 'utf8'))
    return new Set(Array.isArray(stored) ? stored : [])
  } catch {
    return new Set()
  }
}

const remember = (paymentId) => {
  const sent = readSent()
  sent.add(paymentId)
  fs.mkdirSync(path.dirname(STORE), { recursive: true })
  fs.writeFileSync(STORE, JSON.stringify([...sent], null, 2))
}

const listPayments = async () => {
  const apiKey = process.env.INSTAMOJO_API_KEY?.trim()
  const authToken = process.env.INSTAMOJO_AUTH_TOKEN?.trim()
  if (!apiKey || !authToken) return []

  const response = await fetch(PAYMENTS_URL, {
    headers: { 'X-Api-Key': apiKey, 'X-Auth-Token': authToken },
    signal: AbortSignal.timeout(15000),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.success === false) {
    console.error('Instamojo payment list failed:', response.status)
    return []
  }
  return Array.isArray(body.payments) ? body.payments : []
}

const sendThanks = async ({ to, product }) => {
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  if (!user || !pass) {
    console.error('Thank-you email is waiting: add SMTP_PASS (a Gmail app password) to .env')
    return false
  }

  const link = templateUrl(product.id)
  const text = link
    ? `${THANKS}\n\nYour ${product.name} template:\n${link}\n`
    : `${THANKS}\n`

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
  })

  await transport.sendMail({
    from: `"The Coquette Atelier" <${user}>`,
    to,
    subject: `Thank you for ${product.name}`,
    text,
  })
  return true
}

export const deliverVerifiedPayments = async () => {
  const sent = readSent()
  const payments = await listPayments()

  for (const payment of payments) {
    const paymentId = String(payment.payment_id || '')
    const status = String(payment.status || '').toLowerCase()
    const email = String(payment.buyer_email || '').trim()
    if (!paymentId || sent.has(paymentId) || status !== 'credit') continue

    const product = productForAmount(payment.amount)
    if (!product || !email) {
      console.error(`Instamojo payment ${paymentId} is paid, but it has no matching product or buyer email.`)
      continue
    }

    const delivered = await sendThanks({ to: email, product })
    if (delivered) {
      remember(paymentId)
      console.log(`Thank-you email sent for ${paymentId}`)
    }
  }
}

export function startThankYouMailer() {
  if (globalThis.__atelierThanks) return
  globalThis.__atelierThanks = true
  const tick = () => {
    deliverVerifiedPayments().catch((error) => {
      console.error('Thank-you mail:', error.message)
    })
  }
  tick()
  setInterval(tick, 60_000)
}
