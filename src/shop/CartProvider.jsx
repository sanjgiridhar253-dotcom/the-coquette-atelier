import { useEffect, useMemo, useState } from 'react'
import { CartContext } from './cartContext'
import { findProduct } from './catalog'

const STORAGE_KEY = 'atelier-cart'

// The cart is a list of product ids, kept in this browser so it survives a refresh. Each
// template appears at most once: it is a digital design, bought once rather than in quantity.
const readStoredIds = () => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    return Array.isArray(stored) ? stored.filter((id) => findProduct(id)) : []
  } catch {
    // Storage is blocked or holds something unreadable: start with an empty cart.
    return []
  }
}

function CartProvider({ children }) {
  const [ids, setIds] = useState(readStoredIds)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // Storage is blocked: the cart still works, it just will not survive a refresh.
    }
  }, [ids])

  // Keep other open tabs of the shop in step.
  useEffect(() => {
    const syncFromOtherTab = (event) => {
      if (event.key === STORAGE_KEY) setIds(readStoredIds())
    }
    window.addEventListener('storage', syncFromOtherTab)
    return () => window.removeEventListener('storage', syncFromOtherTab)
  }, [])

  const cart = useMemo(() => {
    const items = ids.map(findProduct).filter(Boolean)
    return {
      items,
      total: items.reduce((sum, item) => sum + item.price, 0),
      has: (id) => ids.includes(id),
      add: (id) => setIds((current) => (current.includes(id) ? current : [...current, id])),
      remove: (id) => setIds((current) => current.filter((item) => item !== id)),
      clear: () => setIds([]),
    }
  }, [ids])

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>
}

export default CartProvider
