const pool = require('../config/db')
const { asyncHandler } = require('../middleware')

// Resolve an event id from its slug, or null if missing.
async function eventIdBySlug(slug) {
  const [rows] = await pool.query('SELECT id FROM events WHERE slug = ? LIMIT 1', [slug])
  return rows.length ? rows[0].id : null
}

async function countFor(eventId) {
  const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM rsvps WHERE event_id = ?', [eventId])
  return n
}

// GET /events/:slug/rsvp — is the current user going, and the total count.
exports.status = asyncHandler(async (req, res) => {
  const eventId = await eventIdBySlug(req.params.slug)
  if (!eventId) return res.status(404).json({ error: 'Event not found' })
  const [mine] = await pool.query(
    'SELECT id FROM rsvps WHERE event_id = ? AND user_id = ? LIMIT 1',
    [eventId, req.user.id]
  )
  const [reg] = await pool.query(
    'SELECT name, email, phone, data FROM event_registrations WHERE event_id = ? AND user_id = ? LIMIT 1',
    [eventId, req.user.id]
  )
  const registration = reg.length
    ? { ...reg[0], data: typeof reg[0].data === 'string' ? JSON.parse(reg[0].data || '{}') : reg[0].data || {} }
    : null
  res.json({ going: mine.length > 0, count: await countFor(eventId), registration })
})

// POST /events/:slug/rsvp — toggle the current user's RSVP.
// Cancelling also removes their registration details for the event.
exports.toggle = asyncHandler(async (req, res) => {
  const eventId = await eventIdBySlug(req.params.slug)
  if (!eventId) return res.status(404).json({ error: 'Event not found' })
  const [existing] = await pool.query(
    'SELECT id FROM rsvps WHERE event_id = ? AND user_id = ? LIMIT 1',
    [eventId, req.user.id]
  )
  let going
  if (existing.length) {
    await pool.query('DELETE FROM rsvps WHERE id = ?', [existing[0].id])
    await pool.query('DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?', [eventId, req.user.id])
    going = false
  } else {
    await pool.query('INSERT INTO rsvps (user_id, event_id) VALUES (?, ?)', [req.user.id, eventId])
    going = true
  }
  res.json({ going, count: await countFor(eventId) })
})

// POST /events/:slug/register — save the sign-up form and RSVP the user.
// Re-submitting updates the stored details (upsert on user+event).
exports.register = asyncHandler(async (req, res) => {
  const eventId = await eventIdBySlug(req.params.slug)
  if (!eventId) return res.status(404).json({ error: 'Event not found' })

  const { name, email, phone = null, data = {} } = req.body
  await pool.query(
    `INSERT INTO event_registrations (event_id, user_id, name, email, phone, data)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email),
       phone = VALUES(phone), data = VALUES(data)`,
    [eventId, req.user.id, name, email, phone, JSON.stringify(data ?? {})]
  )
  // Registering implies going: ensure an RSVP row exists (idempotent).
  await pool.query(
    'INSERT IGNORE INTO rsvps (user_id, event_id) VALUES (?, ?)',
    [req.user.id, eventId]
  )
  res.status(201).json({ going: true, registered: true, count: await countFor(eventId) })
})

// GET /me/rsvps — events the current user has RSVP'd to (for the account page).
exports.mine = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT e.slug, e.title, e.start_at AS date, e.venue, e.image
       FROM rsvps r JOIN events e ON e.id = r.event_id
      WHERE r.user_id = ?
      ORDER BY e.start_at DESC`,
    [req.user.id]
  )
  res.json(rows)
})
