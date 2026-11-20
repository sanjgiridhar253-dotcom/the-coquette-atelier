import { Link } from 'react-router-dom'
import { formatPrice } from '../shop/catalog'

// Shared “payment confirmed” sheet: thank-you card art + Canva template links.
function DeliverySuccess({ order, eyebrow = 'Thank you' }) {
  return (
    <section className="shop-page" aria-labelledby="delivery-title">
      <p className="section-eyebrow shop-eyebrow">{eyebrow}</p>
      <h1 id="delivery-title">
        Your invitation <em>is ready.</em>
      </h1>
      <p className="shop-lede">
        Your payment is confirmed. Open your editable Canva template below, and keep this page or
        bookmark the links — they are yours to keep.
      </p>

      <div className="shop-sheet delivery-sheet">
        <figure className="thank-you-card">
          <img src="/thank you card.png" alt="A thank-you card from The Coquette Atelier" />
        </figure>

        <ul className="shop-delivery">
          {order.items.map((item) => (
            <li className="shop-delivery-item" key={item.id}>
              <p className="shop-line-kind">Editable Canva template</p>
              <h2>{item.name}</h2>
              <a className="product-cta" href={item.templateUrl} target="_blank" rel="noreferrer">
                Open your template in Canva <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>

        {(order.amount != null || order.paymentId) && (
          <div className="shop-receipt">
            {order.amount != null && (
              <p>
                Paid <span>{formatPrice(order.amount)}</span>
              </p>
            )}
            {order.paymentId && (
              <p>
                Payment <span>{order.paymentId}</span>
              </p>
            )}
            {order.orderId && (
              <p>
                Order <span>{order.orderId}</span>
              </p>
            )}
          </div>
        )}

        <div className="shop-actions">
          <Link className="product-cta" to="/">
            Back to the Atelier <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DeliverySuccess
