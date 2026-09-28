const mongoose = require('mongoose')

const ratingSchema = new mongoose.Schema(
  {
    mediaId: {
      ref: 'Media',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    value: {
      max: 5,
      min: 1,
      required: true,
      type: Number,
      validate: {
        validator: (v) => Number.isInteger(v),
        message: 'Rating value must be an integer between 1 and 5',
      },
    },
  },
  { timestamps: true },
)

ratingSchema.index({ mediaId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('Rating', ratingSchema)