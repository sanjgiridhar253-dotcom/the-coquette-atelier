import { Link } from 'react-router-dom'
import { CORRESPONDENCE, CORRESPONDENCE_URL, navLinks } from '../siteContent'

function Footer() {
  return (
    <footer className="atelier-footer" aria-label="Site footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="footer-wordmark" to="/#top">The Coquette Atelier</Link>
          <p>Tender, beautifully crafted stationery for life’s most enchanting celebrations.</p>
        </div>

        <nav className="footer-column" aria-label="Footer navigation">
          <p className="footer-label">Explore</p>
          <ul>
            {navLinks.map(([label, target]) => (
              <li key={target}>
                <Link to={`/#${target}`}>{label}</Link>
              </li>
            ))}
            <li>
              <Link to="/cart">Bag</Link>
            </li>
          </ul>
        </nav>

        <div className="footer-column">
          <p className="footer-label">Correspondence</p>
          <a href={CORRESPONDENCE_URL}>{CORRESPONDENCE}</a>
          <p className="footer-note">Digital invitations, editable in Canva.</p>
        </div>
      </div>

      <div className="footer-ornament" aria-hidden="true">
        <span className="footer-monogram">C</span>
      </div>

      <div className="footer-base">
        <span>Made with love &amp; a little magic</span>
        <span>The Coquette Atelier · Est. 2026</span>
        <Link to="/#top">
          Back to top <span aria-hidden="true">↑</span>
        </Link>
      </div>
    </footer>
  )
}

export default Footer
