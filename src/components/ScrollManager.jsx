import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Where the window sits after a move between pages: at the section named in the address
// (/#contact), otherwise at the top. Back and forward are left to the browser, which
// returns to where the visitor was.
function ScrollManager() {
  const { pathname, hash, key } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1))
    if (target) {
      target.scrollIntoView()
    } else if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    // `key` changes on every navigation, so following a link to the section already in
    // the address still scrolls to it.
  }, [pathname, hash, key, navigationType])

  return null
}

export default ScrollManager
