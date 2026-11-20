// Everything sold in the shop. These details are public: the pages show them, and the
// server (server/app.js) reads the same list to work out what to charge, so a price
// altered in someone's browser changes nothing.
//
// What a buyer receives is deliberately NOT here. Each product's template link lives in
// .env (TEMPLATE_URL_<ID>) and is only sent once a payment has been confirmed.

export const CURRENCY = 'INR'

export const products = [
  {
    id: 'sweet-seventeen',
    name: 'Sweet Seventeen',
    kind: 'Editable Canva invitation',
    collection: 'THE BIRTHDAY COLLECTION · 001',
    description: 'An editable invitation for a celebration worth remembering.',
    image: '/BIRTHDAY INVITE PNG.png',
    // In rupees.
    price: 199,
    previews: [
      {
        src: '/THE COQUETTE BIRTHDAY INVITE.png',
        label: 'Mockup',
        alt: 'Sweet Seventeen invitation mockup, with ribbon, envelope, and pearls',
      },
      {
        src: '/thank you card.png',
        label: 'Thank-you note',
        alt: 'Thank-you note included with Sweet Seventeen',
      },
      {
        src: '/BIRTHDAY INVITE PNG.png',
        label: 'Invitation',
        alt: 'Sweet Seventeen birthday invitation',
      },
    ],
  },
]

export const findProduct = (id) => products.find((product) => product.id === id)

const priceFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

export const formatPrice = (amount) => priceFormat.format(amount)
