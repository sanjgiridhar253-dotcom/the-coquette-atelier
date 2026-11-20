import { createContext, useContext } from 'react'

export const CartContext = createContext(null)

// { items, total, has(id), add(id), remove(id), clear() } — see CartProvider.
export const useCart = () => useContext(CartContext)
