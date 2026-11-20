// Your UPI receiving address. Amount comes from the product / bag total in Pay.jsx.
//
// Example: 'sanjgiridhar@oksbi' or 'yourname@paytm'
export const UPI_ID = 'sanjanagiridhar253-1@okicici'

export const UPI_PAYEE_NAME = 'The Coquette Atelier'

const paymentQuery = ({ amount, note }) =>
  new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_PAYEE_NAME,
    am: Number(amount).toFixed(2),
    cu: 'INR',
    tn: note || 'The Coquette Atelier',
  }).toString()

export const buildUpiLink = (options) => `upi://pay?${paymentQuery(options)}`

// App-specific schemes open GPay / PhonePe / Paytm directly on phones.
// Desktop browsers ignore these — use the QR instead.
export const buildUpiAppLinks = (options) => {
  const q = paymentQuery(options)
  return {
    any: `upi://pay?${q}`,
    gpay: `tez://upi/pay?${q}`,
    phonepe: `phonepe://pay?${q}`,
    paytm: `paytmmp://pay?${q}`,
  }
}

export const qrImageUrl = (upiLink) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(upiLink)}`
