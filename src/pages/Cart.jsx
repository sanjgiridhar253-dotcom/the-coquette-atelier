import { Link } from 'react-router-dom'
import { useCart } from '../shop/cartContext'
import { formatPrice } from '../shop/catalog'

function Cart() {
  const cart = useCart()

  return (
    <section className="shop-page" aria-labelledby="cart-title">
      <p className="section-eyebrow shop-eyebrow">The Atelier Bag</p>
      <h1 id="cart-title">
        Your <em>little collection.</em>
      </h1>
      <p className="shop-lede">
        Digital invitations wait here until you are ready to take them home.
      </p>

      <div className="shop-sheet">
        {cart.items.length === 0 ? (
          <div className="shop-empty">
            <p>Your bag is empty — the Birthday Collection is waiting whenever you are.</p>
            <Link className="product-cta" to="/#birthday-invitations">
              Browse the Collection <span aria-hidden="true">↗</span>
            </Link>
          </div>
        ) : (
          <>
            <ul className="shop-list">
              {cart.items.map((item) => (
                <li className="shop-line" key={item.id}>
                  <div className="shop-thumb">
                    <img src={item.image} alt="" />
                  </div>
                  <div className="shop-line-copy">
                    <p className="shop-line-kind">{item.kind}</p>
                    <h2>{item.name}</h2>
                    <p className="shop-line-meta">{item.collection}</p>
                  </div>
                  <div className="shop-line-side">
                    <p className="shop-price">{formatPrice(item.price)}</p>
                    <button
                      className="shop-text-button"
                      type="button"
                      onClick={() => cart.remove(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="shop-summary">
              <p className="shop-summary-label">Total</p>
              <p className="shop-summary-total">{formatPrice(cart.total)}</p>
            </div>

            <div className="shop-actions">
              <Link className="product-cta" to="/pay">
                Pay · {formatPrice(cart.total)} <span aria-hidden="true">↗</span>
              </Link>
              <Link className="shop-ghost-link" to="/#birthday-invitations">
                Continue browsing
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Cart
