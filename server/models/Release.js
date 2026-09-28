const mongoose = require("mongoose");
const { FANDOMS, RELEASE_TYPES, RELEASE_STATUSES } = require("./constants");

const releaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 160 },
    releaseType: { type: String, enum: RELEASE_TYPES, required: true, index: true },
    fandom: { type: String, enum: FANDOMS, required: true, index: true },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    releaseDate: { type: Date, required: [true, "Release date is required"], index: true },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: RELEASE_STATUSES, default: "upcoming", index: true },
    externalUrl: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

releaseSchema.index({ releaseType: 1, status: 1, releaseDate: 1 });

module.exports = mongoose.model("Release", releaseSchema);
