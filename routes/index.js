const express = require('express')
const { body } = require('express-validator')
const c = require('../controllers/content')
const f = require('../controllers/forms')
const auth = require('../controllers/auth')
const rsvps = require('../controllers/rsvps')
const sub = require('../controllers/submissions')
const adminRoutes = require('./admin')
const { validate } = require('../middleware')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// ---- Content (read) ----
router.get('/events', c.listEvents) // ?past=1 for past events
router.get('/events/:slug', c.getEvent)

router.get('/creators', c.listCreators)
router.get('/cosplayers', c.listCreators)
router.get('/creators/:slug', c.getCreator)
router.get('/cosplayers/:slug', c.getCreator)

router.get('/blog', c.listPosts)
router.get('/blog/:slug', c.getPost)

router.get('/gallery', c.listGallery)
router.get('/products', c.listProducts)
router.get('/testimonials', c.listTestimonials)
router.get('/stats', c.listStats)
router.get('/team', c.listTeam)
router.get('/partners', c.listPartners)

// ---- Forms (write) ----
router.post(
  '/contact',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('type').optional().isIn(['general', 'partner', 'volunteer']),
  ],
  validate,
  f.submitContact
)

router.post(
  '/newsletter',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('name').optional().trim(),
  ],
  validate,
  f.subscribe
)

// ---- Auth ----
router.post(
  '/auth/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  auth.login
)
router.post(
  '/auth/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  auth.register
)
router.post('/auth/google', auth.googleAuth)
router.get('/auth/me', requireAuth, auth.me)
router.put(
  '/auth/profile',
  requireAuth,
  [body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')],
  validate,
  auth.updateProfile
)

// ---- RSVP (members) ----
router.get('/events/:slug/rsvp', requireAuth, rsvps.status)
router.post('/events/:slug/rsvp', requireAuth, rsvps.toggle)
router.post(
  '/events/:slug/register',
  requireAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
  ],
  validate,
  rsvps.register
)
router.get('/me/rsvps', requireAuth, rsvps.mine)

// ---- Member submissions (pending admin approval) ----
router.get('/me/submissions', requireAuth, sub.mine)
router.post(
  '/me/creators',
  requireAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('kind').optional().isIn(['creator', 'cosplayer']),
  ],
  validate,
  sub.createCreator
)
router.put(
  '/me/creators/:id',
  requireAuth,
  [body('name').trim().notEmpty().withMessage('Name is required')],
  validate,
  sub.updateCreator
)
router.post(
  '/me/blog',
  requireAuth,
  [body('title').trim().notEmpty().withMessage('Title is required')],
  validate,
  sub.createPost
)
router.put(
  '/me/blog/:id',
  requireAuth,
  [body('title').trim().notEmpty().withMessage('Title is required')],
  validate,
  sub.updatePost
)

// ---- Admin (protected inside) ----
router.use('/admin', adminRoutes)

module.exports = router
