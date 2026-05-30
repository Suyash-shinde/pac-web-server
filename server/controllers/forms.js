const pool = require('../config/db')
const { asyncHandler } = require('../middleware')

// type: general | partner | volunteer
exports.submitContact = asyncHandler(async (req, res) => {
  const { type = 'general', name, email, subject, org, area, message } = req.body
  await pool.query(
    `INSERT INTO contact_messages (type, name, email, subject, org, area, message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [type, name, email, subject || null, org || null, area || null, message]
  )
  res.status(201).json({ ok: true, message: 'Message received' })
})

exports.subscribe = asyncHandler(async (req, res) => {
  const { name, email, interests } = req.body
  await pool.query(
    `INSERT INTO newsletter_signups (name, email, interests)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), interests = VALUES(interests)`,
    [name || null, email, interests || null]
  )
  res.status(201).json({ ok: true, message: 'Subscribed' })
})
