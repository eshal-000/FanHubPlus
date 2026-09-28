const Content = require("../models/Content");
const { searchCondition } = require("../utils/search");

const SORTS = {
  "-popularity": { popularity: -1 },
  popularity: { popularity: 1 },
  "-releaseDate": { releaseDate: -1 },
  releaseDate: { releaseDate: 1 },
  title: { title: 1 },
  "-createdAt": { createdAt: -1 },
};

exports.getContent = async (req, res, next) => {
  try {
    const { category, type, sort, popularity, search } = req.query;

    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (popularity !== undefined && !Number.isNaN(Number(popularity))) {
      query.popularity = { $gte: Number(popularity) };
    }
    const cond = searchCondition(search, ["title", "description"]);
    if (cond) Object.assign(query, cond);

    const sortSpec = SORTS[sort] || SORTS["-popularity"];

    const page = parseInt(req.query.page, 10);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
    const paginate = Number.isFinite(page) && page > 0;

    const mongoQuery = Content.find(query).sort(sortSpec);
    if (paginate) mongoQuery.skip((page - 1) * limit).limit(limit);

    const items = await mongoQuery.lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};
