const mongoose = require("mongoose");
const { FEEDBACK_TYPES, FEEDBACK_STATUSES } = require("./constants");

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    name: { type: String, default: "Guest", trim: true, maxlength: 80 },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    type: { type: String, enum: FEEDBACK_TYPES, required: true, index: true },
    subject: { type: String, required: [true, "Subject is required"], trim: true, maxlength: 160 },
    message: {
      type: String,
      required: [true, "Message is required"],
      minlength: [10, "Message needs at least 10 characters"],
      maxlength: 2000,
    },
    rating: { type: Number, min: 1, max: 5, default: null },
    status: { type: String, enum: FEEDBACK_STATUSES, default: "open", index: true },
    adminNote: { type: String, default: "", maxlength: 2000 },
  },
  { timestamps: true }
);

feedbackSchema.index({ status: 1, type: 1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
