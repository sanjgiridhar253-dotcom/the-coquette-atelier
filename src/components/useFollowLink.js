import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// A click handler that follows an ordinary <a href="/..."> inside the app instead of
// reloading the page. For anchors that cannot be a router <Link> (animated ones).
// Clicks meant for a new tab or window are left to the browser.
export function useFollowLink() {
  const navigate = useNavigate()
  return useCallback(
    (event) => {
      const newTab = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      if (event.defaultPrevented || newTab) return
      event.preventDefault()
      navigate(event.currentTarget.getAttribute('href'))
    },
    [navigate],
  )
}
