const mongoose = require('mongoose')

const characterSchema = new mongoose.Schema(
  {
    abilities: { default: [], type: [String] },
    bannerUrl: { default: '', type: String },
    bio: { default: '', type: String },
    category: { default: '', type: String },
    categorySlug: { required: true, type: String },
    fandom: { default: '', type: String },
    image: { default: '', type: String },
    fullBio: { default: '', type: String },
    imageUrl: { default: '', type: String },
    likes: { default: 0, type: Number },
    name: { required: true, trim: true, type: String },
    quote: { default: '', type: String },
    rating: { default: 4.5, type: Number },
    relatedContent: { default: [], type: [mongoose.Schema.Types.Mixed] },
    series: { default: '', type: String },
    stats: [
      {
        label: { type: String },
        value: { type: Number },
      },
    ],
    status: { default: 'published', enum: ['draft', 'published'], type: String },
    tags: { default: [], type: [String] },
    title: { default: '', type: String },
    traits: { default: [], type: [String] },
    views: { default: 0, type: Number },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Character', characterSchema)
