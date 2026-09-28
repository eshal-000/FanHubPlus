import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    fandom: { type: String, default: '' },
    body: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'published'],
      default: 'pending',
    },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;