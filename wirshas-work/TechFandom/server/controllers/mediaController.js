const Media = require("../models/Media");

exports.getMedia = async (req, res, next) => {
  try {
    const { fandom, category, tags, mediaType } = req.query;

    const query = {};
    if (fandom) query.fandom = fandom;
    if (category) query.category = category;
    if (mediaType) query.mediaType = mediaType;
    if (tags) {

      const tagList = String(tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length) query.tags = { $in: tagList };
    }

    const page = parseInt(req.query.page, 10);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
    const paginate = Number.isFinite(page) && page > 0;

    const mongoQuery = Media.find(query).sort({ releaseYear: -1, createdAt: -1 });
    if (paginate) mongoQuery.skip((page - 1) * limit).limit(limit);

    const items = await mongoQuery.lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};
