import { Navigate } from 'react-router-dom'
import { useCart } from '../shop/cartContext'

function Checkout() {
  const cart = useCart()
  if (cart.items.length === 0) return <Navigate to="/cart" replace />
  return <Navigate to="/pay" replace />
}

export default Checkout
