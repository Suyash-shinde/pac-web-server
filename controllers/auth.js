const bcrypt = require('bcryptjs')
const { OAuth2Client } = require('google-auth-library')
const pool = require('../config/db')
const { asyncHandler } = require('../middleware')
const { signToken } = require('../middleware/auth')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

// Shape a DB user row for the client (never expose password_hash).
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone || null,
  avatar: u.avatar || null,
})

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
  const user = rows[0]
  if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  res.json({ token: signToken(user), user: publicUser(user) })
})

// Self-service signup for regular members.
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email])
  if (existing.length) return res.status(409).json({ error: 'An account with this email already exists' })

  const hash = await bcrypt.hash(password, 10)
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'member')`,
    [name, email, hash]
  )
  const user = { id: result.insertId, name, email, role: 'member' }
  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

// Sign in / sign up with a Google ID token (credential) from Google Identity Services.
exports.googleAuth = asyncHandler(async (req, res) => {
  if (!GOOGLE_CLIENT_ID) return res.status(503).json({ error: 'Google sign-in is not configured' })
  const { credential } = req.body
  if (!credential) return res.status(422).json({ error: 'Missing Google credential' })

  let payload
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID })
    payload = ticket.getPayload()
  } catch {
    return res.status(401).json({ error: 'Invalid Google credential' })
  }

  const googleId = payload.sub
  const email = payload.email
  const name = payload.name || email
  const avatar = payload.picture || null

  // Match by google_id first, then by email (link an existing email/password account).
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE google_id = ? OR email = ? LIMIT 1',
    [googleId, email]
  )
  let user = rows[0]
  if (user) {
    await pool.query(
      'UPDATE users SET google_id = ?, avatar = COALESCE(avatar, ?) WHERE id = ?',
      [googleId, avatar, user.id]
    )
  } else {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, google_id, avatar, role) VALUES (?, ?, ?, ?, 'member')`,
      [name, email, googleId, avatar]
    )
    user = { id: result.insertId, name, email, role: 'member', avatar }
  }
  res.json({ token: signToken(user), user: publicUser(user) })
})

// Returns the current user from a valid token (req.user set by requireAuth).
exports.me = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, phone, avatar FROM users WHERE id = ? LIMIT 1',
    [req.user.id]
  )
  if (!rows.length) return res.status(404).json({ error: 'User not found' })
  res.json(publicUser(rows[0]))
})

// Update the current user's reusable profile (used to prefill RSVP/submission forms).
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body
  await pool.query(
    'UPDATE users SET name = COALESCE(?, name), phone = ?, avatar = ? WHERE id = ?',
    [name || null, phone || null, avatar || null, req.user.id]
  )
  const [rows] = await pool.query(
    'SELECT id, name, email, role, phone, avatar FROM users WHERE id = ? LIMIT 1',
    [req.user.id]
  )
  res.json(publicUser(rows[0]))
})
