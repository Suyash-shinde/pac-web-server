const pool = require('../config/db')
const { asyncHandler } = require('../middleware')

// ---- Row mappers: shape DB rows to match the client's expected fields ----

const mapEvent = (r) => ({
  slug: r.slug,
  title: r.title,
  category: r.category,
  date: r.start_at,
  venue: r.venue,
  mapUrl: r.map_url || null,
  image: r.image,
  excerpt: r.excerpt,
  price: r.price,
  attendance: r.attendance,
  rsvpCount: r.rsvp_count != null ? Number(r.rsvp_count) : 0,
})

const mapCreator = (r) => ({
  slug: r.slug,
  name: r.name,
  specialty: r.specialty,
  level: r.level || undefined,
  commissions: r.commissions || undefined,
  avatar: r.avatar,
  cover: r.cover,
  bio: r.bio,
  socials: typeof r.socials === 'string' ? JSON.parse(r.socials || '{}') : r.socials || {},
})

const mapPost = (r) => ({
  slug: r.slug,
  title: r.title,
  category: r.category,
  author: r.author,
  date: r.published_at,
  image: r.image,
  excerpt: r.excerpt,
  body: r.body,
})

// ---- Events ----
const EVENT_SELECT =
  'SELECT e.*, (SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id) AS rsvp_count FROM events e'

exports.listEvents = asyncHandler(async (req, res) => {
  const past = req.query.past === '1' ? 1 : 0
  const [rows] = await pool.query(
    `${EVENT_SELECT} WHERE e.is_past = ? ORDER BY e.start_at ` + (past ? 'DESC' : 'ASC'),
    [past]
  )
  res.json(rows.map(mapEvent))
})

exports.getEvent = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${EVENT_SELECT} WHERE e.slug = ? LIMIT 1`, [req.params.slug])
  if (!rows.length) return res.status(404).json({ error: 'Event not found' })
  res.json(mapEvent(rows[0]))
})

// ---- Creators / Cosplayers ----
exports.listCreators = asyncHandler(async (req, res) => {
  const kind = req.path.includes('cosplayer') ? 'cosplayer' : 'creator'
  // Only approved entries are public, and they're shown in random order.
  const [rows] = await pool.query(
    "SELECT * FROM creators WHERE kind = ? AND status = 'approved' ORDER BY RAND()",
    [kind]
  )
  res.json(rows.map(mapCreator))
})

exports.getCreator = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM creators WHERE slug = ? AND status = 'approved' LIMIT 1",
    [req.params.slug]
  )
  if (!rows.length) return res.status(404).json({ error: 'Creator not found' })
  res.json(mapCreator(rows[0]))
})

// ---- Blog ----
exports.listPosts = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM blog_posts WHERE status = 'approved' ORDER BY published_at DESC"
  )
  res.json(rows.map(mapPost))
})

exports.getPost = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM blog_posts WHERE slug = ? AND status = 'approved' LIMIT 1",
    [req.params.slug]
  )
  if (!rows.length) return res.status(404).json({ error: 'Post not found' })
  res.json(mapPost(rows[0]))
})

// ---- Simple list resources ----
exports.listGallery = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, category, src FROM gallery_items ORDER BY id DESC')
  res.json(rows)
})

exports.listProducts = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT slug, name, category, price, image, tag FROM products ORDER BY id')
  res.json(rows)
})

exports.listTestimonials = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT name, role, avatar, quote FROM testimonials ORDER BY id')
  res.json(rows)
})

exports.listStats = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT label, value FROM stats ORDER BY sort_order, id')
  res.json(rows)
})

exports.listTeam = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT name, role, team_group AS `group`, avatar FROM team_members ORDER BY id')
  res.json(rows)
})

exports.listPartners = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT name FROM partners ORDER BY id')
  res.json(rows.map((r) => r.name))
})
