import { useMemo } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../shop/cartContext'
import { findProduct, formatPrice } from '../shop/catalog'
import { UPI_ID, buildUpiAppLinks, buildUpiLink, qrImageUrl } from '../shop/upi'

function Pay() {
  const [params] = useSearchParams()
  const cart = useCart()
  const productParam = params.get('product')

  const fromCart = cart.items.length > 0
  const items = fromCart
    ? cart.items
    : [findProduct(productParam || 'sweet-seventeen')].filter(Boolean)

  const amount = items.reduce((sum, item) => sum + item.price, 0)
  const note = items.map((item) => item.name).join(', ') || 'The Coquette Atelier'

  const gpayLink = useMemo(() => buildUpiAppLinks({ amount, note }).gpay, [amount, note])
  const qrSrc = useMemo(() => qrImageUrl(buildUpiLink({ amount, note })), [amount, note])

  if (items.length === 0) {
    return <Navigate to="/#birthday-invitations" replace />
  }

  return (
    <section className="shop-page pay-page" aria-labelledby="pay-title">
      <p className="section-eyebrow shop-eyebrow">Secure checkout</p>
      <h1 id="pay-title">
        Pay <em>{formatPrice(amount)}</em>
      </h1>
      <p className="shop-lede">
        Open Google Pay on your phone, or scan the code with Google Pay. The amount is{' '}
        {formatPrice(amount)} to {UPI_ID}.
      </p>

      <div className="shop-sheet pay-sheet">
        <ul className="shop-list pay-order-list">
          {items.map((item) => (
            <li className="pay-order" key={item.id}>
              <div className="shop-thumb">
                <img src={item.image} alt="" />
              </div>
              <div className="shop-line-copy">
                <p className="shop-line-kind">{item.kind}</p>
                <h2>{item.name}</h2>
                <p className="shop-price">{formatPrice(item.price)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="shop-summary" style={{ width: 'min(100%, 420px)' }}>
          <p className="shop-summary-label">Amount due</p>
          <p className="shop-summary-total">{formatPrice(amount)}</p>
        </div>

        <div className="pay-qr-block">
          <img className="pay-qr" src={qrSrc} alt={`Google Pay QR code for ${formatPrice(amount)}`} />
          <p className="pay-qr-caption">Scan with Google Pay</p>
          <p className="pay-upi-id">{UPI_ID}</p>
        </div>

        <div className="shop-actions">
          <a className="product-cta" href={gpayLink}>
            Google Pay <span aria-hidden="true">↗</span>
          </a>
          <Link className="shop-ghost-link" to="/#birthday-invitations">
            Back to the collection
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Pay
