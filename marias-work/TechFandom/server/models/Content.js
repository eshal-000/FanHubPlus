import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['article', 'video', 'audio', 'image', 'gallery', 'review', 'news'],
      required: true,
    },
    categorySlug: { type: String, required: true },
    description: { type: String, default: '' },
    body: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    tags: { type: [String], default: [] },
    releaseYear: { type: Number, default: 2025 },
    rating: { type: Number, default: 4.5 },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

const Content = mongoose.model('Content', contentSchema);

export default Content;