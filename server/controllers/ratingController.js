const mongoose = require('mongoose')
const Rating = require('../models/Rating')
const Media = require('../models/Media')

function ensureDbConnected(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503)
    throw new Error('Database is not connected. Check MONGODB_URI in server/.env')
  }
}


function ensureValidMediaId(res, mediaId) {
  if (!mongoose.isValidObjectId(mediaId)) {
    res.status(400)
    throw new Error('Invalid mediaId format')
  }
}



async function getMediaRating(req, res, next) {
  try {
    ensureDbConnected(res)
    ensureValidMediaId(res, req.params.mediaId)

    const { mediaId } = req.params

    const mediaExists = await Media.exists({ _id: mediaId })
    if (!mediaExists) {
      res.status(404)
      throw new Error('Media not found')
    }

    const aggregation = await Rating.aggregate([
      { $match: { mediaId: new mongoose.Types.ObjectId(mediaId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$value' },
          ratingCount: { $sum: 1 },
        },
      },
    ])

    const stats = aggregation[0] || { averageRating: 0, ratingCount: 0 }

    let userRating = null
    if (req.user) {
      const existing = await Rating.findOne({
        mediaId,
        userId: req.user._id,
      }).lean()
      userRating = existing ? existing.value : null
    }

    res.status(200).json({
      mediaId,
      averageRating: Number((stats.averageRating || 0).toFixed(2)),
      ratingCount: stats.ratingCount,
      userRating,
    })
  } catch (error) {
    next(error)
  }
}



async function upsertRating(req, res, next) {
  try {
    ensureDbConnected(res)
    ensureValidMediaId(res, req.params.mediaId)

    const { mediaId } = req.params
    const { value } = req.body

    const numericValue = Number(value)
    if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 5) {
      res.status(400)
      throw new Error('Rating value must be an integer between 1 and 5')
    }

    const mediaExists = await Media.exists({ _id: mediaId })
    if (!mediaExists) {
      res.status(404)
      throw new Error('Media not found')
    }


    const rating = await Rating.findOneAndUpdate(
      { mediaId, userId: req.user._id },
      { value: numericValue },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    res.status(200).json({
      data: {
        mediaId: rating.mediaId,
        userId: rating.userId,
        value: rating.value,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt,
      },
    })
  } catch (error) {
    next(error)
  }
}



async function deleteRating(req, res, next) {
  try {
    ensureDbConnected(res)
    ensureValidMediaId(res, req.params.mediaId)

    const { mediaId } = req.params

    const deleted = await Rating.findOneAndDelete({
      mediaId,
      userId: req.user._id,
    })

    if (!deleted) {
      res.status(404)
      throw new Error('No rating found for this user on this media')
    }

    res.status(200).json({ message: 'Rating removed' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getMediaRating,
  upsertRating,
  deleteRating,
}