// Talks to the shop API (server/app.js). Errors thrown here carry a message written for
// the shopper, so pages can show `error.message` as it is.
export async function postJson(path, body) {
  let response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('We could not reach the atelier. Please check your connection and try again.')
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || 'Something went wrong. Please try again.')
  return data
}

let razorpayScript

// Loads Razorpay's checkout window on first use. A failed load is forgotten so the next
// attempt tries again.
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  razorpayScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => {
      script.remove()
      razorpayScript = undefined
      reject(new Error('The payment window could not load. Please check your connection and try again.'))
    }
    document.head.append(script)
  })
  return razorpayScript
}
