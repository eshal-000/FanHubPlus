const express = require('express')
const router = express.Router()
const {
  getMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
} = require('../controllers/mediaController')
const ratingRoutes = require('./ratingRoutes')
const { protect, requireRole } = require('../middleware/auth')


router.get('/', getMedia)
router.get('/:id', getMediaById)


router.post('/', protect, requireRole('admin'), createMedia)
router.put('/:id', protect, requireRole('admin'), updateMedia)
router.delete('/:id', protect, requireRole('admin'), deleteMedia)


router.use('/:mediaId/rating', ratingRoutes)

module.exports = router