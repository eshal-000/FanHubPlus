import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: {
      type: String,
      enum: ['article', 'character', 'content', 'video', 'merchandise'],
      required: true,
    },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;