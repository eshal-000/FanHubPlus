const mongoose = require("mongoose");
const { FANDOMS, ARTICLE_CATEGORIES, ARTICLE_STATUSES, makeSlug } = require("./constants");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 160 },
    slug: { type: String, unique: true, index: true },
    author: { type: String, required: [true, "Author is required"], trim: true, maxlength: 80 },
    fandom: { type: String, enum: FANDOMS, required: true, index: true },
    category: { type: String, enum: ARTICLE_CATEGORIES, required: true, index: true },
    body: { type: String, default: "", maxlength: 60000 }, 
    imageUrls: {
      type: [String],
      default: [],
      alias: "coverImage", 
    },
    excerpt: { type: String, default: "", maxlength: 400 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ARTICLE_STATUSES, default: "draft", index: true },
    views: { type: Number, default: 0, min: 0 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

articleSchema.pre("validate", function () {
  if (!this.slug && this.title) this.slug = makeSlug(this.title);
  if (typeof this.imageUrls === "string") this.imageUrls = [this.imageUrls];
  if (Array.isArray(this.imageUrls)) {
    this.imageUrls = [...new Set(this.imageUrls.filter(Boolean))];
  }
  if (this.status === "published" && !this.publishedAt) this.publishedAt = new Date();
});

articleSchema.index({ title: "text", excerpt: "text", body: "text" });
articleSchema.index({ fandom: 1, category: 1, publishedAt: -1 });
articleSchema.index({ status: 1, featured: -1, publishedAt: -1 });

module.exports = mongoose.model("Article", articleSchema);
