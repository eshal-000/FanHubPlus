import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, default: '' },
    series: { type: String, default: '' },
    categorySlug: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    fullBio: { type: String, default: '' },
    abilities: { type: [String], default: [] },
    stats: [
      {
        label: { type: String },
        value: { type: Number },
      },
    ],
    tags: { type: [String], default: [] },
    quote: { type: String, default: '' },
    rating: { type: Number, default: 4.5 },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

const Character = mongoose.model('Character', characterSchema);

export default Character;