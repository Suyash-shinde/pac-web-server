const pool = require('../config/db')
const { asyncHandler } = require('../middleware')

// Build a URL-safe slug from a name/title, with a short random suffix to avoid
// collisions with existing approved entries.
function slugify(text) {
  const base = String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 110)
  return `${base || 'item'}-${Math.random().toString(36).slice(2, 7)}`
}

// ---- Cosplayer / Creator submissions ----

exports.createCreator = asyncHandler(async (req, res) => {
  const { name, kind, specialty, level, commissions, avatar, cover, bio, socials } = req.body
  const data = {
    slug: slugify(name),
    name,
    kind: kind === 'cosplayer' ? 'cosplayer' : 'creator',
    specialty: specialty || null,
    level: level || null,
    commissions: commissions || null,
    avatar: avatar || null,
    cover: cover || null,
    bio: bio || null,
    socials: JSON.stringify(socials || {}),
    featured: 0,
    status: 'pending',
    submitted_by: req.user.id,
  }
  const [result] = await pool.query('INSERT INTO creators SET ?', [data])
  res.status(201).json({ id: result.insertId })
})

exports.updateCreator = asyncHandler(async (req, res) => {
  // Only the owner may edit, and any edit re-enters the pending queue.
  const [rows] = await pool.query('SELECT submitted_by FROM creators WHERE id = ? LIMIT 1', [req.params.id])
  if (!rows.length) return res.status(404).json({ error: 'Not found' })
  if (rows[0].submitted_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const { name, specialty, level, commissions, avatar, cover, bio, socials } = req.body
  const data = {
    name,
    specialty: specialty || null,
    level: level || null,
    commissions: commissions || null,
    avatar: avatar || null,
    cover: cover || null,
    bio: bio || null,
    socials: JSON.stringify(socials || {}),
    status: 'pending',
  }
  await pool.query('UPDATE creators SET ? WHERE id = ?', [data, req.params.id])
  res.json({ ok: true })
})

// ---- Blog submissions ----

exports.createPost = asyncHandler(async (req, res) => {
  const { title, category, image, excerpt, body } = req.body
  const data = {
    slug: slugify(title),
    title,
    category: category || null,
    author: req.user.name,
    published_at: new Date(),
    image: image || null,
    excerpt: excerpt || null,
    body: body || null,
    status: 'pending',
    submitted_by: req.user.id,
  }
  const [result] = await pool.query('INSERT INTO blog_posts SET ?', [data])
  res.status(201).json({ id: result.insertId })
})

exports.updatePost = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT submitted_by FROM blog_posts WHERE id = ? LIMIT 1', [req.params.id])
  if (!rows.length) return res.status(404).json({ error: 'Not found' })
  if (rows[0].submitted_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const { title, category, image, excerpt, body } = req.body
  const data = {
    title,
    category: category || null,
    image: image || null,
    excerpt: excerpt || null,
    body: body || null,
    status: 'pending',
  }
  await pool.query('UPDATE blog_posts SET ? WHERE id = ?', [data, req.params.id])
  res.json({ ok: true })
})

// ---- The current user's own submissions (any status) ----
exports.mine = asyncHandler(async (req, res) => {
  const [creators] = await pool.query(
    'SELECT * FROM creators WHERE submitted_by = ? ORDER BY id DESC',
    [req.user.id]
  )
  const [posts] = await pool.query(
    'SELECT * FROM blog_posts WHERE submitted_by = ? ORDER BY id DESC',
    [req.user.id]
  )
  const creatorsOut = creators.map((c) => ({
    ...c,
    socials: typeof c.socials === 'string' ? JSON.parse(c.socials || '{}') : c.socials || {},
  }))
  res.json({ creators: creatorsOut, posts })
})
