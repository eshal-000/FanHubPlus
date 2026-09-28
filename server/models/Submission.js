const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema(
  {
    adminNote: { default: '', type: String },
    body: { default: '', type: String },
    category: { required: true, type: String },
    fandom: { default: '', type: String },
    imageUrl: { default: '', type: String },
    publishedArticleId: { default: null, ref: 'Article', type: mongoose.Schema.Types.ObjectId },
    publishedAt: { type: Date },
    publishedContentId: { default: null, ref: 'Content', type: mongoose.Schema.Types.ObjectId },
    publishedModel: { default: null, enum: [null, 'Article', 'Content'], type: String },
    reviewedAt: { type: Date },
    reviewedBy: { default: null, ref: 'User', type: mongoose.Schema.Types.ObjectId },
    status: {
      default: 'pending',
      enum: ['pending', 'approved', 'rejected', 'published'],
      type: String,
    },
    title: { required: true, trim: true, type: String },
    userId: { ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Submission', submissionSchema)
