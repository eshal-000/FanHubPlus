const mongoose = require("mongoose");

const FANDOMS = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];
const CATEGORIES = [
  "Protagonist",
  "Antagonist",
  "Supporting",
  "Idol",
  "Mentor",
  "Rival",
  "Comic Relief",
  "Legendary",
];

const relatedContentSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["article", "media", "merch"], required: true },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "relatedContent.kind" },
  },
  { _id: false }
);

const characterSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Character name is required"], trim: true, maxlength: 100 },
    fandom: { type: String, enum: FANDOMS, required: true, index: true },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    image: {
      type: String,
      default: "",
      alias: "imageUrl", 
    },
    bio: { type: String, default: "", maxlength: 4000 },
    traits: [{ type: String, trim: true }],
    relatedContent: [relatedContentSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

characterSchema.index({ name: "text", bio: "text", traits: "text" });
characterSchema.index({ fandom: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model("Character", characterSchema);
