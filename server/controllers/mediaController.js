const mongoose = require('mongoose')
const Media = require('../models/Media')
const Rating = require('../models/Rating')

function ensureDbConnected(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503)
    throw new Error('Database is not connected. Check MONGODB_URI in server/.env')
  }
}


async function attachRatings(mediaList) {
  if (!mediaList.length) return []

  const mediaIds = mediaList.map((m) => m._id)

  const ratingsAgg = await Rating.aggregate([
    { $match: { mediaId: { $in: mediaIds } } },
    {
      $group: {
        _id: '$mediaId',
        averageRating: { $avg: '$value' },
        ratingCount: { $sum: 1 },
      },
    },
  ])

  const ratingMap = new Map()
  ratingsAgg.forEach((r) => {
    ratingMap.set(String(r._id), {
      averageRating: Number((r.averageRating || 0).toFixed(2)),
      ratingCount: r.ratingCount,
    })
  })

  return mediaList.map((m) => ({
    ...m,
    averageRating: ratingMap.get(String(m._id))?.averageRating ?? 0,
    ratingCount: ratingMap.get(String(m._id))?.ratingCount ?? 0,
  }))
}



async function getMedia(req, res, next) {
  try {
    ensureDbConnected(res)

    const { category, fandom, mediaType, limit = 20 } = req.query
    const filter = {}
    if (category) filter.category = category
    if (fandom) filter.fandom = fandom
    if (mediaType) filter.mediaType = mediaType

    let query = Media.find(filter).sort({ createdAt: -1 })

    const parsedLimit = Number(limit)
    if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
      query = query.limit(parsedLimit)
    }

    const media = await query.lean()
    const withRatings = await attachRatings(media)

    res.status(200).json({
      count: withRatings.length,
      data: withRatings,
    })
  } catch (error) {
    next(error)
  }
}



async function getMediaById(req, res, next) {
  try {
    ensureDbConnected(res)

    const media = await Media.findById(req.params.id).lean()
    if (!media) {
      res.status(404)
      throw new Error('Media not found')
    }

    const [withRating] = await attachRatings([media])

    res.status(200).json({ data: withRating })
  } catch (error) {
    next(error)
  }
}



async function createMedia(req, res, next) {
  try {
    ensureDbConnected(res)

    const { title, mediaType, embedUrl, thumbnailUrl, category, fandom, tags, releaseYear } = req.body

    if (!title || !mediaType || !embedUrl || !category || !fandom) {
      res.status(400)
      throw new Error('title, mediaType, embedUrl, category, and fandom are required')
    }

    const media = await Media.create({
      title,
      mediaType,
      embedUrl,
      thumbnailUrl,
      category,
      fandom,
      tags: tags || [],
      releaseYear,
    })

    res.status(201).json({ data: media })
  } catch (error) {
    next(error)
  }
}



async function updateMedia(req, res, next) {
  try {
    ensureDbConnected(res)

    const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!media) {
      res.status(404)
      throw new Error('Media not found')
    }
    res.status(200).json({ data: media })
  } catch (error) {
    next(error)
  }
}



async function deleteMedia(req, res, next) {
  try {
    ensureDbConnected(res)

    const media = await Media.findByIdAndDelete(req.params.id)
    if (!media) {
      res.status(404)
      throw new Error('Media not found')
    }


    await Rating.deleteMany({ mediaId: req.params.id })

    res.status(200).json({ message: 'Media removed' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
}