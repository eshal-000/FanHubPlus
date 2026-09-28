const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
  {
    color: { default: '#ff006b', trim: true, type: String },
    description: { default: '', type: String },
    gradient: { default: '', trim: true, type: String },
    heroImage: { default: '', trim: true, type: String },
    icon: { default: '', trim: true, type: String },
    image: { default: '', trim: true, type: String },
    name: { required: true, trim: true, type: String },
    shortDescription: { default: '', type: String },
    slug: { required: true, trim: true, type: String },
    sortOrder: { default: 0, type: Number },
    sourceAssetPath: { default: '', trim: true, type: String },
    status: { default: 'active', enum: ['active', 'hidden'], type: String },
    totalContent: { default: 0, min: 0, type: Number },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Category', categorySchema)
