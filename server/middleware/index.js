const { validationResult } = require('express-validator')

/** Wrap async route handlers so thrown errors reach the error middleware. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/** Run after express-validator checks; returns 422 with the first errors. */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Validation failed', details: errors.array() })
  }
  next()
}

const notFound = (req, res) => {
  res.status(404).json({ error: 'Not found' })
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Server error' })
}

module.exports = { asyncHandler, validate, notFound, errorHandler }
