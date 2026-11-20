import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import RibbonBow from './RibbonBow'
import { findProduct, formatPrice } from '../shop/catalog'
import { useCart } from '../shop/cartContext'

const sweetSeventeen = findProduct('sweet-seventeen')
const pieces = sweetSeventeen.previews

function BirthdayCollection() {
  const cart = useCart()
  const [previewIndex, setPreviewIndex] = useState(null)
  const previewOpen = previewIndex !== null
  const dialogRef = useRef(null)
  const [justAdded, setJustAdded] = useState(false)
  const reduceMotion = useReducedMotion()
  const triggerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const inCart = cart.has(sweetSeventeen.id)

  useEffect(() => {
    if (!previewOpen) return undefined

    const previousBodyOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const closeOnKey = (event) => {
      if (event.key === 'Escape') {
        setPreviewIndex(null)
      } else if (event.key === 'ArrowLeft') {
        setPreviewIndex((index) => (index + pieces.length - 1) % pieces.length)
      } else if (event.key === 'ArrowRight') {
        setPreviewIndex((index) => (index + 1) % pieces.length)
      } else if (event.key === 'Tab') {
        const controls = [...(dialogRef.current?.querySelectorAll('button') ?? [])]
        if (!controls.length) return
        event.preventDefault()
        const current = controls.indexOf(document.activeElement)
        const next = event.shiftKey
          ? (current <= 0 ? controls.length - 1 : current - 1)
          : (current === controls.length - 1 || current < 0 ? 0 : current + 1)
        controls[next].focus()
      }
    }
    window.addEventListener('keydown', closeOnKey)
    return () => {
      window.removeEventListener('keydown', closeOnKey)
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousRootOverflow
      triggerRef.current?.focus()
    }
  }, [previewOpen])

  useEffect(() => {
    if (!justAdded) return undefined
    const timer = window.setTimeout(() => setJustAdded(false), 2400)
    return () => window.clearTimeout(timer)
  }, [justAdded])

  const openPreview = (event, index) => {
    triggerRef.current = event.currentTarget
    setPreviewIndex(index)
  }
  const closePreview = () => setPreviewIndex(null)
  const showPrevious = () => setPreviewIndex((index) => (index + pieces.length - 1) % pieces.length)
  const showNext = () => setPreviewIndex((index) => (index + 1) % pieces.length)
  const activePiece = previewOpen ? pieces[previewIndex] : null

  const addToBag = () => {
    cart.add(sweetSeventeen.id)
    setJustAdded(true)
  }

  return (
    <section className="birthday-edit" id="birthday-invitations">
      <motion.div
        className="edit-introduction"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="section-eyebrow">THE COQUETTE ATELIER · 002</p>
        <h2>The Birthday Edit</h2>
        <p className="edit-supporting">A little invitation for a moment worth remembering.</p>
      </motion.div>

      <div className="featured-product">
        <motion.div
          className="product-visual"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <RibbonBow className="product-ribbon-mark" />
          <span className="product-star product-star-one" aria-hidden="true">✧</span>
          <span className="product-star product-star-two" aria-hidden="true">✦</span>
          <div className="product-suite">
            {pieces.map((piece, index) => (
              <motion.button
                key={piece.label}
                className="suite-piece"
                type="button"
                aria-label={`View a larger ${piece.label.toLowerCase()}`}
                aria-haspopup="dialog"
                onClick={(event) => openPreview(event, index)}
                whileHover={reduceMotion ? undefined : { y: -6 }}
                whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <img src={piece.src} alt={piece.alt} loading="lazy" />
                <span className="suite-label">{piece.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="product-information"
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="product-category">{sweetSeventeen.collection}</p>
          <h3>
            <span>Seventeen,</span>
            <em>in Full Bloom.</em>
          </h3>
          <p className="product-description">{sweetSeventeen.description}</p>
          <p className="product-price">{formatPrice(sweetSeventeen.price)}</p>
          <dl className="product-details">
            <div>
              <dt>FORMAT</dt>
              <dd>Digital invitation</dd>
            </div>
            <div>
              <dt>PERSONALISATION</dt>
              <dd>Editable Canva template</dd>
            </div>
          </dl>
          <div className="product-actions">
            <Link className="product-cta" to={`/pay?product=${sweetSeventeen.id}`}>
              Buy · {formatPrice(sweetSeventeen.price)} <span aria-hidden="true">↗</span>
            </Link>
            {inCart ? (
              <Link className="product-cta" to="/cart">
                {justAdded ? 'Added to Bag' : 'View Bag'} <span aria-hidden="true">↗</span>
              </Link>
            ) : (
              <button className="product-cta" type="button" onClick={addToBag}>
                Add to Bag <span aria-hidden="true">↗</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Rendered on <body> so the preview sits above the pinned header. */}
      {createPortal(
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            className="product-modal-backdrop"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.24 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) closePreview()
            }}
          >
            <motion.div
              ref={dialogRef}
              className="product-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`${sweetSeventeen.name} ${activePiece.label}`}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.975, y: 10 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985, y: 6 }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                ref={closeButtonRef}
                className="modal-close"
                type="button"
                aria-label="Close preview"
                onClick={closePreview}
              >
                ×
              </button>
              <img src={activePiece.src} alt={activePiece.alt} />
              <div className="modal-nav">
                <button type="button" aria-label="Previous piece" onClick={showPrevious}>‹</button>
                <p>{activePiece.label}</p>
                <button type="button" aria-label="Next piece" onClick={showNext}>›</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </section>
  )
}

export default BirthdayCollection
