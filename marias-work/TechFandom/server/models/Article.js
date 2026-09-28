import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: '' },
    body: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    categorySlug: { type: String, required: true },
    author: { type: String, default: 'Fan Hub Plus' },
    authorAvatar: { type: String, default: '' },
    readTime: { type: String, default: '5 min read' },
    tags: { type: [String], default: [] },
    rating: { type: Number, default: 4.5 },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

const Article = mongoose.model('Article', articleSchema);

export default Article;