const pool = require('../config/db')
const { asyncHandler } = require('../middleware')

/**
 * Build CRUD handlers for a table given its allowed columns.
 * Keeps each resource's endpoints tiny and consistent.
 */
function crud(table, columns, { jsonColumns = [] } = {}) {
  const pick = (body) => {
    const data = {}
    for (const col of columns) {
      if (body[col] === undefined) continue
      data[col] = jsonColumns.includes(col) ? JSON.stringify(body[col] ?? {}) : body[col]
    }
    return data
  }

  return {
    list: asyncHandler(async (req, res) => {
      const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`)
      res.json(rows)
    }),

    get: asyncHandler(async (req, res) => {
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [req.params.id])
      if (!rows.length) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    }),

    create: asyncHandler(async (req, res) => {
      const data = pick(req.body)
      if (!Object.keys(data).length) return res.status(422).json({ error: 'No fields provided' })
      const [result] = await pool.query(`INSERT INTO ${table} SET ?`, [data])
      res.status(201).json({ id: result.insertId })
    }),

    update: asyncHandler(async (req, res) => {
      const data = pick(req.body)
      if (!Object.keys(data).length) return res.status(422).json({ error: 'No fields provided' })
      const [result] = await pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [data, req.params.id])
      if (!result.affectedRows) return res.status(404).json({ error: 'Not found' })
      res.json({ ok: true })
    }),

    remove: asyncHandler(async (req, res) => {
      const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id])
      if (!result.affectedRows) return res.status(404).json({ error: 'Not found' })
      res.json({ ok: true })
    }),
  }
}

exports.events = crud('events', [
  'slug', 'title', 'category', 'start_at', 'venue', 'map_url', 'image', 'excerpt', 'price', 'attendance', 'is_past',
])

exports.blog = crud('blog_posts', [
  'slug', 'title', 'category', 'author', 'published_at', 'image', 'excerpt', 'body', 'status',
])

exports.creators = crud(
  'creators',
  ['slug', 'name', 'kind', 'specialty', 'level', 'commissions', 'avatar', 'cover', 'bio', 'socials', 'featured', 'status'],
  { jsonColumns: ['socials'] }
)

exports.products = crud('products', ['slug', 'name', 'category', 'price', 'image', 'tag'])

// ---- Read-only views of form submissions ----
exports.contactMessages = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC')
  res.json(rows)
})

exports.newsletterSignups = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM newsletter_signups ORDER BY created_at DESC')
  res.json(rows)
})

// ---- Dashboard counts ----
exports.stats = asyncHandler(async (req, res) => {
  const [[counts]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM events) AS events,
      (SELECT COUNT(*) FROM blog_posts) AS posts,
      (SELECT COUNT(*) FROM creators) AS creators,
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM contact_messages) AS messages,
      (SELECT COUNT(*) FROM newsletter_signups) AS subscribers
  `)
  res.json(counts)
})
