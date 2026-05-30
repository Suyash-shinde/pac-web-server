const express = require('express')
const a = require('../controllers/admin')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

// All admin routes require an authenticated admin.
router.use(requireAuth, requireRole('admin'))

router.get('/stats', a.stats)
router.get('/contact-messages', a.contactMessages)
router.get('/newsletter', a.newsletterSignups)

// Generic CRUD per resource
for (const [path, ctrl] of [
  ['events', a.events],
  ['blog', a.blog],
  ['creators', a.creators],
  ['products', a.products],
]) {
  router.get(`/${path}`, ctrl.list)
  router.get(`/${path}/:id`, ctrl.get)
  router.post(`/${path}`, ctrl.create)
  router.put(`/${path}/:id`, ctrl.update)
  router.delete(`/${path}/:id`, ctrl.remove)
}

module.exports = router
