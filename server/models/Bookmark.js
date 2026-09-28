const mongoose = require("mongoose");
const { BOOKMARK_ITEM_TYPES } = require("./constants");

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemType: { type: String, enum: BOOKMARK_ITEM_TYPES, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemData: { type: mongoose.Schema.Types.Mixed, default: {} },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
