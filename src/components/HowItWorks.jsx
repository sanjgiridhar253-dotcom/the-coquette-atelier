import { motion, useReducedMotion } from 'framer-motion'

const passages = [
  {
    number: '01',
    title: 'The Secret Passage',
    description: 'Every celebration begins with a little mystery. Discover the invitation that speaks to your special occasion.',
    link: 'Enter the Collection',
    image: '/BIRTHDAY INVITE PNG.png',
    imageAlt: 'Pink bow birthday invitation for a sweet seventeen celebration',
    charm: 'key',
  },
  {
    number: '02',
    title: 'Unlock Your Magic',
    description: 'Add it to your bag, pay securely, and unlock your editable Canva template — then personalise every detail.',
    link: 'Discover Your Invitation',
    image: '/THE COQUETTE BIRTHDAY INVITE.png',
    imageAlt: 'The Coquette Collection birthday invitation suite',
    charm: 'sparkle',
  },
  {
    number: '03',
    title: 'The Grand Reveal',
    description: 'The mystery is solved! Download your finished invitation and share a little magic with everyone you love.',
    link: 'Let the Celebration Begin',
    image: '/thank you card.png',
    imageAlt: 'Pink coquette thank-you card with a bow and rose',
    charm: 'flower',
  },
]

function PassageCharm({ type }) {
  if (type === 'key') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="13" cy="13" r="7" />
        <path d="M19 18 39 38m-7-7 5-5m-10 1 5-5" />
      </svg>
    )
  }

  if (type === 'sparkle') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="m24 3 5.2 14.8L44 23l-14.8 5.2L24 43l-5.2-14.8L4 23l14.8-5.2Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 42C4 30 9 16 18 16c4 0 6 3 6 6 0-3 2-6 6-6 9 0 14 14-6 26Z" />
      <path d="M24 21v19M24 29l-7-6m7 11 8-7" />
    </svg>
  )
}

function HowItWorks() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="how-it-works" id="how-it-works" aria-labelledby="how-it-works-title">
      <div className="how-it-works-inner">
        <motion.header
          className="how-it-works-heading"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-eyebrow">A birthday mystery in three passages</p>
          <h2 id="how-it-works-title">The Coquette Collection</h2>
          <p>Follow the little clues from the first sealed note to the grand reveal—your digital invitation is waiting.</p>
        </motion.header>

        <div className="mystery-steps">
          {passages.map((passage, index) => (
            <motion.article
              className="mystery-stage"
              key={passage.number}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.22 }}
              transition={{ duration: 0.75, delay: reduceMotion ? 0 : index * 0.12 }}
            >
              <div className="passage-art">
                <div className="passage-frame">
                  <img src={passage.image} alt={passage.imageAlt} loading="lazy" />
                  <span className="passage-charm" aria-hidden="true">
                    <PassageCharm type={passage.charm} />
                  </span>
                </div>
              </div>
              <div className="passage-copy">
                <p className="passage-number">Passage {passage.number}</p>
                <h3>{passage.title}</h3>
                <p className="passage-description">{passage.description}</p>
                <a className="passage-link" href="#birthday-invitations">
                  {passage.link} <span aria-hidden="true">→</span>
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
