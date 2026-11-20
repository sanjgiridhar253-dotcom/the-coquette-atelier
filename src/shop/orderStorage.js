// Keeps the last confirmed order in this tab so /order survives a refresh. Cleared when
// the shopper starts a new checkout.

const KEY = 'atelier-last-order'

export const saveOrder = (order) => {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(order))
  } catch {
    // Session storage is blocked: the order page will still work for this navigation.
  }
}

export const readOrder = () => {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(KEY))
    return stored?.items?.length ? stored : null
  } catch {
    return null
  }
}

export const clearOrder = () => {
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    // Nothing to do.
  }
}
