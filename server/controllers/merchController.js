const Merch = require("../models/Merch");
const { searchCondition } = require("../utils/search");

exports.getMerch = async (req, res, next) => {
  try {
    const { fandom, category, tags, search } = req.query;

    const query = {};
    if (fandom) query.fandom = fandom;
    if (category) query.category = category;
    if (tags) {
      const tagList = String(tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length) query.tags = { $in: tagList };
    }
    const cond = searchCondition(search, ["name", "description", "tags"]);
    if (cond) Object.assign(query, cond);

    const page = parseInt(req.query.page, 10);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
    const paginate = Number.isFinite(page) && page > 0;

    const mongoQuery = Merch.find(query).sort({ isUpcoming: -1, createdAt: -1 });
    if (paginate) {
      mongoQuery.skip((page - 1) * limit).limit(limit);
    } else if (req.query.limit) {
      mongoQuery.limit(limit);
    }

    const items = await mongoQuery.lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.getMerchById = async (req, res, next) => {
  try {
    const merch = await Merch.findById(req.params.id).lean();
    if (!merch) return res.status(404).json({ message: "Merch item not found." });

    const relatedMerch = await Merch.find({
      _id: { $ne: merch._id },
      $or: [{ fandom: merch.fandom }, { category: merch.category }],
    })
      .sort({ isUpcoming: -1, createdAt: -1 })
      .limit(4)
      .lean();

    res.json({ merch, relatedMerch });
  } catch (err) {
    next(err);
  }
};
