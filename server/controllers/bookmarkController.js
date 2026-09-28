const mongoose = require("mongoose");
const Bookmark = require("../models/Bookmark");
const Article = require("../models/Article");
const Character = require("../models/Character");
const Content = require("../models/Content");
const Media = require("../models/Media");
const Merch = require("../models/Merch");
const { BOOKMARK_ITEM_TYPES } = require("../models/constants");

const MODEL_BY_TYPE = {
  article: Article,
  character: Character,
  content: Content,
  media: Media,
  merch: Merch,
  merchandise: Merch,
  video: Content,
};

exports.getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();

    const idsByType = {};
    for (const b of bookmarks) {
      (idsByType[b.itemType] = idsByType[b.itemType] || []).push(b.itemId);
    }

    const docsByType = {};
    await Promise.all(
      Object.entries(idsByType).map(async ([type, ids]) => {
        const Model = MODEL_BY_TYPE[type];
        if (!Model) return;
        docsByType[type] = await Model.find({ _id: { $in: ids } }).lean();
      })
    );

    const items = bookmarks.map((b) => {
      const pool = docsByType[b.itemType] || [];
      const item = pool.find((d) => String(d._id) === String(b.itemId)) || null;
      return { ...b, item: item || b.itemData || null };
    });

    res.json({ items, bookmarks: items, count: items.length });
  } catch (err) {
    next(err);
  }
};

exports.addBookmark = async (req, res, next) => {
  try {
    const { itemData, itemId, itemType, note = "" } = req.body || {};

    if (!BOOKMARK_ITEM_TYPES.includes(itemType)) {
      return res
        .status(400)
        .json({ message: `itemType must be one of: ${BOOKMARK_ITEM_TYPES.join(", ")}.` });
    }
    if (!itemId || !mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({ message: "A valid itemId is required." });
    }

    const Model = MODEL_BY_TYPE[itemType];
    if (!Model) return res.status(400).json({ message: `Unsupported bookmark item type: ${itemType}.` });

    const exists = await Model.exists({ _id: itemId });
    if (!exists) return res.status(404).json({ message: `${itemType} not found.` });

    const bookmark = await Bookmark.findOneAndUpdate(
      { userId: req.user.id, itemType, itemId },
      {
        $set: { itemData: itemData || {}, note },
        $setOnInsert: { userId: req.user.id, itemType, itemId },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ bookmark });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ message: "Already bookmarked." });
    }
    next(err);
  }
};

exports.updateBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "A valid bookmark id is required." });
    }

    const update = {};
    if (note !== undefined) update.note = note;

    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      update,
      { new: true, runValidators: true }
    );

    if (!bookmark) return res.status(404).json({ message: "Bookmark not found." });
    return res.json({ message: "Bookmark updated.", bookmark });
  } catch (err) {
    next(err);
  }
};

exports.removeBookmark = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { itemType } = req.body || {};

    if (!itemId || !mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({ message: "A valid bookmark or item id is required." });
    }

    const query = {
      userId: req.user.id,
      $or: [{ _id: itemId }, { itemId }],
    };
    if (itemType) query.itemType = itemType;

    await Bookmark.deleteOne(query);
    res.json({ message: "Bookmark removed." });
  } catch (err) {
    next(err);
  }
};
