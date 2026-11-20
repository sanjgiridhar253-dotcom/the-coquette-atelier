import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DeliverySuccess from '../components/DeliverySuccess'
import { postJson } from '../shop/api'
import { useCart } from '../shop/cartContext'
import { saveOrder } from '../shop/orderStorage'
import { clearPendingOrder, readPendingOrder } from '../shop/pendingOrder'

function ThankYou() {
  const [params] = useSearchParams()
  const cart = useCart()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(true)

  const paymentId = params.get('payment_id') || ''
  const paymentRequestId = params.get('payment_request_id') || ''
  const paymentStatus = params.get('payment_status') || ''

  useEffect(() => {
    let cancelled = false

    const confirm = async () => {
      if (!paymentId) {
        setError('No payment was found on this page. Please complete checkout from the shop.')
        setBusy(false)
        return
      }
      if (paymentStatus && paymentStatus.toLowerCase() !== 'credit') {
        setError('That payment was not completed. You can try again from the collection.')
        setBusy(false)
        return
      }

      try {
        const pending = readPendingOrder()
        const confirmed = await postJson('/api/instamojo/confirm', {
          paymentId,
          paymentRequestId: paymentRequestId || undefined,
          items: pending?.items,
        })
        if (cancelled) return
        clearPendingOrder()
        saveOrder(confirmed)
        cart.clear()
        setOrder(confirmed)
      } catch (caught) {
        if (!cancelled) setError(caught.message || 'We could not confirm this payment.')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }

    confirm()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, paymentRequestId, paymentStatus])

  if (busy) {
    return (
      <section className="shop-page">
        <p className="section-eyebrow shop-eyebrow">Confirming</p>
        <h1>
          Just a moment <em>of magic…</em>
        </h1>
        <p className="shop-lede">We are confirming your payment with Instamojo.</p>
      </section>
    )
  }

  if (error || !order) {
    return (
      <section className="shop-page">
        <p className="section-eyebrow shop-eyebrow">Payment</p>
        <h1>
          Not quite <em>there yet.</em>
        </h1>
        <div className="shop-sheet">
          <div className="shop-empty">
            <p>{error || 'We could not unlock your template.'}</p>
            <Link className="product-cta" to="/#birthday-invitations">
              Back to the collection <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return <DeliverySuccess order={order} eyebrow="Thank you" />
}

export default ThankYou
