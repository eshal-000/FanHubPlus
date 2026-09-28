const mongoose = require("mongoose");
const { FANDOMS, SUBMISSION_STATUSES } = require("./constants");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    fandom: { type: String, enum: FANDOMS, required: true, index: true },
    body: { type: String, required: [true, "Body is required"], maxlength: 20000 },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: SUBMISSION_STATUSES, default: "pending", index: true },
    adminNote: { type: String, default: "", maxlength: 2000 },
  },
  { timestamps: true } 
);

submissionSchema.index({ status: 1, createdAt: -1 });
submissionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
