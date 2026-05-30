const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET, {
    expiresIn: '7d',
  })
}

/** Require a valid Bearer token; attaches req.user. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/** Require an authenticated user with one of the given roles. */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

module.exports = { signToken, requireAuth, requireRole, SECRET }
