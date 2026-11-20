import nodemailer from 'nodemailer'

const TOPICS = new Set([
  'A birthday invitation',
  'Help with my template',
  'My order',
  'Something else',
])

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class ContactError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const clean = (value, max) => String(value ?? '').trim().slice(0, max)

export async function deliverContactNote(input) {
  const name = clean(input?.name, 80)
  const email = clean(input?.email, 120)
  const topic = clean(input?.topic, 80)
  const message = clean(input?.message, 2000)

  if (!name) throw new ContactError(400, 'Please add your name.')
  if (!EMAIL.test(email)) throw new ContactError(400, 'Please add a valid email.')
  if (!TOPICS.has(topic)) throw new ContactError(400, 'Please choose what the note is about.')
  if (message.length < 2) throw new ContactError(400, 'Please write a few words.')

  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  if (!user || !pass) {
    console.error('Contact mail is missing SMTP_USER or SMTP_PASS')
    throw new ContactError(503, 'Notes cannot be sent just now. Please write to us directly.')
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
  })

  await transport.sendMail({
    from: `"The Coquette Atelier" <${user}>`,
    to: user,
    replyTo: email,
    subject: `${topic} — a note from ${name}`,
    text: `${message}\n\n${name}\n${email}\n`,
  })
}
