import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CORRESPONDENCE, CORRESPONDENCE_URL } from '../siteContent'

const topics = ['A birthday invitation', 'Help with my template', 'My order', 'Something else']
const emptyNote = { name: '', email: '', topic: topics[0], message: '' }

const validate = ({ name, email, message }) => {
  const errors = {}
  if (!name.trim()) errors.name = 'Please add your name.'
  if (!email.trim()) errors.email = 'Please add your email for a reply.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'That email doesn’t look quite right.'
  if (!message.trim()) errors.message = 'Please write a few words.'
  return errors
}

function Contact() {
  const reduceMotion = useReducedMotion()
  const [note, setNote] = useState(emptyNote)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setNote((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setStatus('')
  }

  const submitNote = async (event) => {
    event.preventDefault()
    const found = validate(note)
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      event.currentTarget.elements[firstInvalid]?.focus()
      return
    }
    setSending(true)
    setStatus('')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'The note could not be sent.')
      setNote(emptyNote)
      setStatus('sent')
    } catch (caught) {
      setStatus(caught.message || 'The note could not be sent.')
    } finally {
      setSending(false)
    }
  }

  const field = (name) => ({
    id: `contact-${name}`,
    name,
    value: note[name],
    onChange: updateField,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
  })

  const fieldError = (name) =>
    errors[name] && (
      <p className="field-error" id={`contact-${name}-error`}>{errors[name]}</p>
    )

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-inner">
        <motion.div
          className="contact-introduction"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-eyebrow">Correspondence</p>
          <h2 id="contact-title">
            <span>Send a</span>
            <em>Little Note.</em>
          </h2>
          <p className="contact-supporting">
            A question about an invitation, or a little help with your template? Write a note to the atelier.
          </p>
          <p className="contact-direct">
            <span>Or write directly</span>
            <a href={CORRESPONDENCE_URL}>{CORRESPONDENCE}</a>
          </p>
        </motion.div>

        <motion.form
          className="contact-form"
          noValidate
          onSubmit={submitNote}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="contact-form-heading">To · The Coquette Atelier</p>

          <div className="contact-field">
            <label htmlFor="contact-name">Your name</label>
            <input type="text" autoComplete="name" required {...field('name')} />
            {fieldError('name')}
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">Your email</label>
            <input type="email" autoComplete="email" required {...field('email')} />
            {fieldError('email')}
          </div>

          <div className="contact-field contact-field-wide">
            <label htmlFor="contact-topic">Regarding</label>
            <select {...field('topic')}>
              {topics.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          <div className="contact-field contact-field-wide">
            <label htmlFor="contact-message">Your note</label>
            <textarea rows={4} required {...field('message')} />
            {fieldError('message')}
          </div>

          <div className="contact-actions">
            <button className="product-cta" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send Your Note'} {!sending && <span aria-hidden="true">↗</span>}
            </button>
            <p className={`contact-hint ${status === 'sent' ? 'is-ready' : ''}`} role="status">
              {status === 'sent'
                ? 'Your note has been sent. A reply will come to the email you wrote above.'
                : status || 'The note is emailed straight to the atelier.'}
            </p>
          </div>
        </motion.form>
      </div>
    </section>
  )
}

export default Contact
