import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { CORRESPONDENCE, CORRESPONDENCE_URL, navLinks } from '../siteContent'
import { useCart } from '../shop/cartContext'
import { useFollowLink } from './useFollowLink'

// The section being read: the last one whose top has passed the upper part of the viewport.
const findCurrentSection = () => {
  let current = navLinks[0][1]
  for (const [, id] of navLinks) {
    const top = document.getElementById(id)?.getBoundingClientRect().top
    if (top !== undefined && top <= window.innerHeight * 0.4) current = id
  }
  return current
}

function Header({ menuOpen, onMenuToggle }) {
  const reduceMotion = useReducedMotion()
  const [scrolled, setScrolled] = useState(() => window.scrollY > 12)
  const [currentSection, setCurrentSection] = useState(navLinks[0][1])
  const { pathname } = useLocation()
  const followLink = useFollowLink()
  const cartCount = useCart().items.length
  const onHome = pathname === '/'

  const followAndCloseMenu = (event) => {
    followLink(event)
    if (menuOpen) onMenuToggle()
  }

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', updateScrolled, { passive: true })
    return () => window.removeEventListener('scroll', updateScrolled)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onMenuToggle()
    }
    window.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [menuOpen, onMenuToggle])

  const toggleMenu = () => {
    if (!menuOpen && onHome) setCurrentSection(findCurrentSection())
    onMenuToggle()
  }

  return (
    <header className={`atelier-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header-row">
        <span className="collection-code">THE BIRTHDAY COLLECTION · 001</span>

        <motion.a
          className="atelier-wordmark"
          href="/#top"
          aria-label="The Coquette Atelier home"
          onClick={followAndCloseMenu}
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span aria-hidden="true">✦</span>
          <span>THE COQUETTE ATELIER</span>
          <span aria-hidden="true">✦</span>
        </motion.a>

        <div className="header-tools">
          <Link
            className="header-cart"
            to="/cart"
            aria-label={cartCount ? `Bag, ${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Bag'}
            onClick={() => { if (menuOpen) onMenuToggle() }}
          >
            <span className="header-cart-label">Bag</span>
            <span className="header-cart-count" aria-hidden="true">{cartCount}</span>
          </Link>

          <button
            className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={toggleMenu}
          >
            <span className="menu-toggle-label" aria-hidden="true">{menuOpen ? 'Close' : 'Menu'}</span>
            <span className="menu-toggle-bars" aria-hidden="true">
              <span /><span /><span />
            </span>
          </button>
        </div>
      </div>

      <motion.div
        id="site-menu"
        className={`menu-overlay ${menuOpen ? 'is-open' : ''}`}
        initial={false}
        animate={menuOpen ? { opacity: 1, visibility: 'visible' } : { opacity: 0, visibility: 'hidden' }}
        transition={{ duration: reduceMotion ? 0 : 0.35 }}
        aria-hidden={!menuOpen}
      >
        <div className="menu-panel">
          <p className="menu-eyebrow">
            <span aria-hidden="true">✦</span> The Atelier Directory <span aria-hidden="true">✦</span>
          </p>
          <nav aria-label="Main navigation">
            {navLinks.map(([item, target], index) => {
              const isCurrent = onHome && target === currentSection
              return (
                <motion.a
                  key={item}
                  href={`/#${target}`}
                  aria-current={isCurrent ? 'location' : undefined}
                  onClick={followAndCloseMenu}
                  initial={reduceMotion ? false : { opacity: 0, x: -18 }}
                  animate={menuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -18 }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, delay: menuOpen ? 0.12 + index * 0.07 : 0 }}
                >
                  <span className="menu-link-index">0{index + 1}</span>
                  <span className="menu-link-label">{item}</span>
                  <span className="menu-link-mark" aria-hidden="true">{isCurrent ? '✦' : '→'}</span>
                </motion.a>
              )
            })}
            <motion.a
              href="/cart"
              aria-current={pathname === '/cart' ? 'location' : undefined}
              onClick={followAndCloseMenu}
              initial={reduceMotion ? false : { opacity: 0, x: -18 }}
              animate={menuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -18 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, delay: menuOpen ? 0.12 + navLinks.length * 0.07 : 0 }}
            >
              <span className="menu-link-index">0{navLinks.length + 1}</span>
              <span className="menu-link-label">Bag{cartCount ? ` · ${cartCount}` : ''}</span>
              <span className="menu-link-mark" aria-hidden="true">{pathname === '/cart' ? '✦' : '→'}</span>
            </motion.a>
          </nav>
        </div>

        <div className="menu-foot">
          <a href={CORRESPONDENCE_URL}>{CORRESPONDENCE}</a>
          <span>Made with love &amp; a little magic</span>
        </div>
      </motion.div>
    </header>
  )
}

export default Header
