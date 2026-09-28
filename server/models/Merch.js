const mongoose = require("mongoose");
const { FANDOMS, MERCH_CATEGORIES, MERCH_TAGS } = require("./constants");

const merchSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true, maxlength: 140 },
    fandom: { type: String, enum: FANDOMS, required: true, index: true },
    category: { type: String, enum: MERCH_CATEGORIES, required: true, index: true },
    images: { type: [String], default: [] },
    tags: [{ type: String, enum: MERCH_TAGS }],
    description: { type: String, default: "", maxlength: 8000 },
    externalUrl: { type: String, default: "" },
    isUpcoming: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

merchSchema.pre("validate", function () {

  if (typeof this.images === "string") {
    this.images = this.images.split(",").map((s) => s.trim()).filter(Boolean);
  } else if (this.images && !Array.isArray(this.images)) {
    this.images = [String(this.images)];
  }
  if (typeof this.tags === "string") {
    this.tags = this.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }

});

merchSchema.index({ name: "text", description: "text", tags: "text" });

merchSchema.index({ fandom: 1, category: 1 });

module.exports = mongoose.model("Merch", merchSchema);
