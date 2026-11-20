import { useEffect } from 'react'

const SCRIPT_SRC = 'https://js.instamojo.com/v1/button.js'

// Instamojo's button.js finds every <a rel="im-checkout"> and turns it into their
// checkout button. In a SPA we re-append the script so newly mounted links are picked up.
function loadInstamojoButtonScript() {
  document.querySelector(`script[src="${SCRIPT_SRC}"]`)?.remove()
  const script = document.createElement('script')
  script.src = SCRIPT_SRC
  script.async = true
  document.body.append(script)
}

function InstamojoPay({ href, label = 'Pay', onBeforeOpen }) {
  useEffect(() => {
    if (!href) return undefined
    loadInstamojoButtonScript()
    return undefined
  }, [href])

  if (!href) return null

  return (
    <a
      key={href}
      className="product-cta instamojo-pay"
      href={href}
      rel="im-checkout"
      data-text={label}
      data-layout="vertical"
      // Atelier CTAs: ivory type on burgundy (not Instamojo's default green).
      data-css-style="color:#fffaf0;background:#713747;width:300px;border-radius:2px"
      onClick={() => {
        onBeforeOpen?.()
      }}
    >
      {label} <span aria-hidden="true">↗</span>
    </a>
  )
}

export default InstamojoPay
