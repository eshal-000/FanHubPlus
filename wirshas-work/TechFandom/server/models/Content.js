const mongoose = require("mongoose");
const { FANDOMS, CONTENT_TYPES, makeSlug } = require("./constants");

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 160 },
    slug: { type: String, unique: true, index: true },
    category: { type: String, enum: FANDOMS, required: true, index: true }, 
    type: { type: String, enum: CONTENT_TYPES, required: true, index: true },
    description: { type: String, default: "", maxlength: 4000 },
    releaseDate: { type: Date, default: null },
    popularity: {
      type: Number,
      default: 0,
      min: [0, "Popularity cannot be negative"],
      max: [100, "Popularity cannot exceed 100"],
      alias: "popularityScore", 
    },
    imageUrl: { type: String, default: "" },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

contentSchema.pre("validate", function () {
  if (!this.slug && this.title) this.slug = makeSlug(this.title);
  if (this.type === "image" && this.imageUrl && typeof this.imageUrl !== "string") {

    this.imageUrl = Array.isArray(this.imageUrl) ? this.imageUrl[0] || "" : String(this.imageUrl);
  }
  if (typeof this.popularity === "string" && this.popularity !== "") {
    this.popularity = Number(this.popularity);
  }

});

contentSchema.index({ category: 1, type: 1, popularity: -1 });

module.exports = mongoose.model("Content", contentSchema);
