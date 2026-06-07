/**
 * Create or update the admin user. Reads credentials from env (or args),
 * falling back to sensible defaults for local dev.
 *
 *   npm run create-admin
 *   ADMIN_EMAIL=me@pac.in ADMIN_PASSWORD=secret npm run create-admin
 */
const bcrypt = require('bcryptjs')
const mysql = require('mysql2/promise')
require('dotenv').config()

const email = process.env.ADMIN_EMAIL || 'admin@pac.local'
const password = process.env.ADMIN_PASSWORD || 'admin123'
const name = process.env.ADMIN_NAME || 'PAC Admin'

async function main() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pac',
  })

  const hash = await bcrypt.hash(password, 10)
  await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'admin'`,
    [name, email, hash]
  )
  await db.end()
  console.log(`✓ Admin ready — email: ${email}  password: ${password}`)
}

main().catch((err) => {
  console.error('create-admin failed:', err.message)
  process.exit(1)
})
