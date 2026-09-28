const mongoose = require("mongoose");
const { FANDOMS, MEDIA_TYPES } = require("./constants");

const mediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 160 },
    mediaType: { type: String, enum: MEDIA_TYPES, required: true, index: true },
    embedUrl: { type: String, required: [true, "Embed URL is required"], trim: true },
    thumbnailUrl: { type: String, default: "" },
    fandom: { type: String, enum: FANDOMS, required: true, index: true },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    tags: [{ type: String, trim: true }],
    releaseYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 5,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

mediaSchema.pre("validate", function () {
  if (typeof this.tags === "string") {
    this.tags = this.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (typeof this.releaseYear === "string" && this.releaseYear !== "") {
    this.releaseYear = Number(this.releaseYear);
  }

});

mediaSchema.index({ title: "text", tags: "text" });
mediaSchema.index({ fandom: 1, category: 1 });

module.exports = mongoose.model("Media", mediaSchema);
