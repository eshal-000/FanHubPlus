const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  getMediaRating,
  upsertRating,
  deleteRating,
} = require('../controllers/ratingController')
const { protect, optionalAuth } = require('../middleware/auth')


router.get('/', optionalAuth, getMediaRating)


router.post('/', protect, upsertRating)
router.delete('/', protect, deleteRating)

module.exports = router