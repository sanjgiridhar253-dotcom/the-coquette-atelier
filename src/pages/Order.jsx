import { Link, useLocation } from 'react-router-dom'
import DeliverySuccess from '../components/DeliverySuccess'
import { readOrder } from '../shop/orderStorage'

function Order() {
  const locationOrder = useLocation().state?.order
  const order = locationOrder?.items?.length ? locationOrder : readOrder()

  if (!order) {
    return (
      <section className="shop-page" aria-labelledby="order-title">
        <p className="section-eyebrow shop-eyebrow">Order</p>
        <h1 id="order-title">
          No order <em>waiting here.</em>
        </h1>
        <div className="shop-sheet">
          <div className="shop-empty">
            <p>Once a payment is confirmed, your thank-you card and editable templates appear here.</p>
            <Link className="product-cta" to="/#birthday-invitations">
              Browse the Collection <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return <DeliverySuccess order={order} eyebrow="Order confirmed" />
}

export default Order
