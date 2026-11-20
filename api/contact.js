import { ContactError, deliverContactNote } from '../server/contactMail.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Send the note with the form.' })
    return
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body
    await deliverContactNote(body)
    response.status(200).json({ ok: true })
  } catch (error) {
    const status = error instanceof ContactError ? error.status : 502
    const message =
      error instanceof ContactError
        ? error.message
        : 'The note could not be sent. Please try again in a moment.'
    if (!(error instanceof ContactError)) console.error('Contact mail failed:', error.message)
    response.status(status).json({ error: message })
  }
}
