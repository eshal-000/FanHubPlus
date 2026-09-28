const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema(
  {
    author: { default: 'Fan Hub Plus', type: String },
    authorAvatar: { default: '', type: String },
    body: { default: '', type: String },
    category: { default: '', type: String },
    categorySlug: { required: true, type: String },
    excerpt: { default: '', type: String },
    fandom: { default: '', type: String },
    featured: { default: false, type: Boolean },
    imageUrl: { default: '', type: String },
    imageUrls: { default: [], type: [String] },
    likes: { default: 0, type: Number },
    publishedAt: { type: Date },
    rating: { default: 4.5, type: Number },
    readTime: { default: '5 min read', type: String },
    slug: { default: '', type: String },
    sourceSubmissionId: { default: null, ref: 'Submission', type: mongoose.Schema.Types.ObjectId },
    status: { default: 'published', enum: ['draft', 'published'], type: String },
    submittedBy: { default: null, ref: 'User', type: mongoose.Schema.Types.ObjectId },
    tags: { default: [], type: [String] },
    title: { required: true, trim: true, type: String },
    views: { default: 0, type: Number },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Article', articleSchema)
