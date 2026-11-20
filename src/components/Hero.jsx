import { useRef, useState } from 'react'
import { motion, useAnimation, useReducedMotion } from 'framer-motion'
import Marquee from './Marquee'

// Decorative scenery. Values are fixed rather than random so the scene is the same on every
// visit; negative delays start each petal part-way down so the hero is never empty on load.
const petals = [
  { x: '5%', size: 22, duration: 18, delay: -2, drift: '70px' },
  { x: '17%', size: 14, duration: 23, delay: -11, drift: '-40px' },
  { x: '31%', size: 17, duration: 20, delay: -15, drift: '90px' },
  { x: '58%', size: 13, duration: 25, delay: -6, drift: '-60px' },
  { x: '72%', size: 19, duration: 19, delay: -9, drift: '50px' },
  { x: '86%', size: 15, duration: 22, delay: -17, drift: '-80px' },
  { x: '94%', size: 21, duration: 21, delay: -13, drift: '-30px' },
]

const sparkles = [
  { x: '12%', y: '20%', size: 16, delay: 0 },
  { x: '24%', y: '60%', size: 10, delay: 1.4 },
  { x: '37%', y: '80%', size: 12, delay: 1.8 },
  { x: '39%', y: '9%', size: 9, delay: 2.6 },
  { x: '63%', y: '58%', size: 14, delay: 0.4 },
  { x: '67%', y: '13%', size: 12, delay: 0.8 },
  { x: '81%', y: '44%', size: 18, delay: 2 },
  { x: '90%', y: '76%', size: 11, delay: 3.2 },
]

const leftTicker = ['Digital invitations', 'Editable in Canva', 'Made with love', 'A little magic']
const rightTicker = ['The Birthday Collection', 'Sweet Seventeen', 'Scroll to explore']

const ease = [0.22, 1, 0.36, 1]

// How far (as a share of its own height) the card lifts before it is brought in front of
// the envelope, and where it rests once presented: centred on the stage, a touch larger.
const CARD_LIFT = '-9%'
const CARD_PRESENTED = { y: '0.8%', scale: 1.03 }
const CARD_TILT = -1.5

// Outline of the part of the lifted card that shows above the pocket's V-shaped opening,
// in the card's own box. The card is clipped to this the moment it moves in front of the
// envelope, then the clip opens out to the full card, so it never pops over the pocket.
// Tied to the card and pocket geometry in App.css (.invitation-card, .envelope-pocket).
const CARD_TUCKED = 'polygon(0% 0%, 100% 0%, 100% 60%, 50% 83.7%, 0% 60%)'
const CARD_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%)'

const SHADOW_TUCKED = 'drop-shadow(0px 3px 5px rgba(113, 55, 71, 0.2))'
const SHADOW_PRESENTED = 'drop-shadow(0px 16px 22px rgba(113, 55, 71, 0.3))'

function HeroAmbience() {
  return (
    <div className="hero-ambience" aria-hidden="true">
      {petals.map((petal) => (
        <span
          className="hero-petal"
          key={petal.x}
          style={{
            '--x': petal.x,
            '--size': `${petal.size}px`,
            '--duration': `${petal.duration}s`,
            '--delay': `${petal.delay}s`,
            '--drift': petal.drift,
          }}
        />
      ))}
      {sparkles.map((sparkle) => (
        <svg
          className="hero-sparkle"
          key={sparkle.x}
          viewBox="0 0 48 48"
          style={{
            '--x': sparkle.x,
            '--y': sparkle.y,
            '--size': `${sparkle.size}px`,
            '--delay': `${sparkle.delay}s`,
          }}
        >
          <path d="m24 3 5.2 14.8L44 23l-14.8 5.2L24 43l-5.2-14.8L4 23l14.8-5.2Z" />
        </svg>
      ))}
    </div>
  )
}

function Hero() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [rotation, setRotation] = useState(0)
  const drag = useRef(null)
  const reduceMotion = useReducedMotion()
  const flapControls = useAnimation()
  const cardControls = useAnimation()
  const cardFaceControls = useAnimation()
  const timed = (duration, easing = ease) => ({ duration: reduceMotion ? 0 : duration, ease: easing })

  const startDrag = (event) => {
    drag.current = { x: event.clientX, rotation }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event) => {
    if (!drag.current) return
    const distance = event.clientX - drag.current.x
    setRotation(Math.max(-12, Math.min(12, drag.current.rotation + distance / 8)))
  }

  const stopDrag = () => {
    drag.current = null
  }

  const toggleInvitation = async () => {
    if (isAnimating) return

    setIsAnimating(true)

    if (!isOpen) {
      // The flap swings up in front of the pocket and, once edge-on, passes behind the card.
      await flapControls.start({ rotateX: 90, transition: timed(0.26, 'easeIn') })
      flapControls.set({ zIndex: 2 })
      await flapControls.start({ rotateX: 180, transition: timed(0.36, 'easeOut') })

      await cardControls.start({ y: CARD_LIFT, rotate: 0, transition: timed(0.5) })
      cardControls.set({ zIndex: 8 })
      cardFaceControls.set({ clipPath: CARD_TUCKED })
      await Promise.all([
        cardControls.start({ ...CARD_PRESENTED, filter: SHADOW_PRESENTED, transition: timed(0.75) }),
        cardFaceControls.start({ clipPath: CARD_FULL, transition: timed(0.75) }),
      ])
      setIsOpen(true)
    } else {
      await Promise.all([
        cardControls.start({ y: CARD_LIFT, scale: 1, filter: SHADOW_TUCKED, transition: timed(0.6) }),
        cardFaceControls.start({ clipPath: CARD_TUCKED, transition: timed(0.6) }),
      ])
      cardControls.set({ zIndex: 3 })
      cardFaceControls.set({ clipPath: CARD_FULL })
      await cardControls.start({ y: '0%', rotate: CARD_TILT, transition: timed(0.5) })

      await flapControls.start({ rotateX: 90, transition: timed(0.32, 'easeIn') })
      flapControls.set({ zIndex: 5 })
      await flapControls.start({ rotateX: 0, transition: timed(0.26, 'easeOut') })
      setIsOpen(false)
    }

    setIsAnimating(false)
  }

  return (
    <section className="hero" id="top">
      <HeroAmbience />

      <Marquee vertical className="hero-ticker hero-ticker-left" items={leftTicker} />
      <Marquee vertical className="hero-ticker hero-ticker-right" items={rightTicker} />

      <motion.p
        className="hero-eyebrow"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        A LITTLE SOMETHING BEAUTIFUL
      </motion.p>

      <motion.h1
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        Every beautiful birthday{' '}
        <br />
        begins with <em>a little magic.</em>
      </motion.h1>

      <motion.p
        className="hero-subtitle"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.55 }}
      >
        An invitation to celebrate your most enchanting day.
      </motion.p>

      <div className="invitation-stage">
        <motion.div
          className={`envelope-object ${isOpen ? 'is-open' : ''}`}
          style={{ rotateY: rotation }}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: reduceMotion ? 0 : [0, -5, 0] }}
          transition={reduceMotion ? { duration: 0 } : { opacity: { duration: 0.8, delay: 0.45 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onClick={toggleInvitation}
        >
          {/* Inside of the envelope: the striped liner seen through the opening. */}
          <div className="envelope-back" />

          <motion.div
            className="invitation-card"
            initial={{ rotate: CARD_TILT, filter: SHADOW_TUCKED }}
            animate={cardControls}
          >
            <motion.div className="invitation-card-face" animate={cardFaceControls}>
              <img src="/BIRTHDAY INVITE PNG.png" alt="The Coquette birthday invitation" loading="eager" />
            </motion.div>
          </motion.div>

          {/* Front of the envelope: two side flaps with the bottom flap folded up over them. */}
          <svg className="envelope-pocket" viewBox="0 0 300 200" aria-hidden="true">
            <defs>
              <linearGradient id="env-side-left" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fffaf3" />
                <stop offset="1" stopColor="#eedcd3" />
              </linearGradient>
              <linearGradient id="env-side-right" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0" stopColor="#fffaf3" />
                <stop offset="1" stopColor="#eedcd3" />
              </linearGradient>
              <linearGradient id="env-bottom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fffdf8" />
                <stop offset="1" stopColor="#f4e6de" />
              </linearGradient>
              <filter id="env-lift" x="-10%" y="-25%" width="120%" height="150%">
                <feDropShadow dx="0" dy="-1.5" stdDeviation="2.5" floodColor="#713747" floodOpacity="0.18" />
              </filter>
              {/* Faint speckle so the paper is not a flat fill. Shared with the flap below. */}
              <filter id="env-grain" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" result="noise" />
                <feColorMatrix
                  in="noise"
                  type="matrix"
                  values="0 0 0 0 0.443  0 0 0 0 0.216  0 0 0 0 0.278  0 0 0 0.2 -0.06"
                  result="speckle"
                />
                <feComposite in="speckle" in2="SourceAlpha" operator="in" result="grain" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="grain" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#env-grain)">
              <path d="M0 0 150 100V200H4Q0 200 0 196Z" fill="url(#env-side-left)" />
              <path d="M300 0 150 100V200H296Q300 200 300 196Z" fill="url(#env-side-right)" />
              <path d="M150 100V116" stroke="#713747" strokeOpacity="0.16" />
              <path d="M3 200 139 116.6Q150 110 161 116.6L297 200Z" fill="url(#env-bottom)" filter="url(#env-lift)" />
            </g>
            <path d="M0 0 150 100 300 0" fill="none" stroke="#fff" strokeOpacity="0.9" />
          </svg>

          <motion.div className="envelope-flap" style={{ transformPerspective: 900 }} animate={flapControls}>
            <svg className="flap-face flap-outer" viewBox="0 0 300 128" aria-hidden="true">
              <defs>
                <linearGradient id="env-flap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f3e4dc" />
                  <stop offset="0.1" stopColor="#fffcf6" />
                  <stop offset="1" stopColor="#f8ece4" />
                </linearGradient>
              </defs>
              <path
                d="M0 3Q0 0 3 0H297Q300 0 300 3L165 115.2Q150 128 135 115.2Z"
                fill="url(#env-flap)"
                filter="url(#env-grain)"
              />
              <path
                d="M16.3 6H283.7L163 109Q150 120.1 137 109Z"
                fill="none"
                stroke="#c5a16c"
                strokeOpacity="0.6"
                strokeWidth="0.8"
              />
            </svg>

            {/* Lined underside, drawn point-up: it is turned over, so it lines up with the
                outer face when shut and faces the viewer once the flap is open. */}
            <svg className="flap-face flap-inner" viewBox="0 0 300 128" aria-hidden="true">
              <defs>
                <pattern id="env-liner" width="14" height="14" patternUnits="userSpaceOnUse">
                  <rect width="14" height="14" fill="#fbe7e5" />
                  <rect width="7" height="14" fill="#f3c6cd" />
                </pattern>
              </defs>
              <path d="M0 125Q0 128 3 128H297Q300 128 300 125L165 12.8Q150 0 135 12.8Z" fill="#fffaf3" />
              <path d="M16.3 122H283.7L163 19Q150 7.9 137 19Z" fill="url(#env-liner)" />
            </svg>

            {/* Satin bow tied behind the seal; the seal sits over its knot at (60, 36). */}
            <svg className="seal-bow" viewBox="0 0 120 90" aria-hidden="true">
              <defs>
                <linearGradient id="env-satin" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="48">
                  <stop offset="0" stopColor="#f5c6cd" />
                  <stop offset="0.5" stopColor="#e7a4b0" />
                  <stop offset="1" stopColor="#d58898" />
                </linearGradient>
                <linearGradient id="env-satin-tail" gradientUnits="userSpaceOnUse" x1="30" y1="0" x2="90" y2="0">
                  <stop offset="0" stopColor="#d58898" />
                  <stop offset="0.3" stopColor="#eeb5bf" />
                  <stop offset="0.5" stopColor="#d58898" />
                  <stop offset="0.7" stopColor="#eeb5bf" />
                  <stop offset="1" stopColor="#d58898" />
                </linearGradient>
              </defs>
              <path d="M55 38C52 53 45 67 31 80L39 80 40 88C52 74 59 57 62 40Z" fill="url(#env-satin-tail)" />
              <path d="M65 38C68 53 75 67 89 80L81 80 80 88C68 74 61 57 58 40Z" fill="url(#env-satin-tail)" />
              <g fill="none" strokeLinecap="round">
                <path
                  d="M60 36C48 14 16 0 8 20 2 38 34 48 60 36M60 36C72 14 104 0 112 20 118 38 86 48 60 36"
                  stroke="url(#env-satin)"
                  strokeWidth="6.5"
                />
                <path
                  d="M60 36C48 14 16 0 8 20 2 38 34 48 60 36M60 36C72 14 104 0 112 20 118 38 86 48 60 36"
                  stroke="#fff"
                  strokeOpacity="0.28"
                  strokeWidth="1.2"
                />
              </g>
            </svg>
            <motion.button
              className="wax-seal"
              type="button"
              aria-label="Open invitation"
              animate={{ pointerEvents: isOpen ? 'none' : 'auto' }}
              onClick={(event) => {
                event.stopPropagation()
                toggleInvitation()
              }}
            >
              C
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <div className="hero-cta-zone">
        <button
          className="product-cta hero-cta"
          type="button"
          disabled={isAnimating}
          aria-disabled={isAnimating}
          onClick={toggleInvitation}
        >
          {isOpen ? 'Close Your Invitation' : 'Open Your Invitation'}
          <span aria-hidden="true">{isOpen ? '↙' : '↗'}</span>
        </button>
      </div>
    </section>
  )
}

export default Hero
