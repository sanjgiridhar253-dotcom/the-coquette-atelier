// Remembers what the shopper was buying while Instamojo takes over the tab.
// Used when checkout falls back to a dashboard payment link (no API-created request).

const KEY = 'atelier-pending-order'

export const savePendingOrder = (order) => {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(order))
  } catch {
    // Session storage blocked — thank-you may not be able to match the order.
  }
}

export const readPendingOrder = () => {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(KEY))
    return stored?.items?.length ? stored : null
  } catch {
    return null
  }
}

export const clearPendingOrder = () => {
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    // Nothing to do.
  }
}
