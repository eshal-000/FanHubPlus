const Release = require("../models/Release");

const SORTS = {
  releaseDate: { releaseDate: 1 },  
  "-releaseDate": { releaseDate: -1 },
  title: { title: 1 },
  "-createdAt": { createdAt: -1 },
};

exports.getReleases = async (req, res, next) => {
  try {
    const { releaseType, fandom, category, status, sort } = req.query;

    const query = {};
    if (releaseType) query.releaseType = releaseType;
    if (fandom) query.fandom = fandom;
    if (category) query.category = category;
    if (status) query.status = status;

    const sortSpec = SORTS[sort] || SORTS.releaseDate;

    const page = parseInt(req.query.page, 10);
    const limit = Math.min(parseInt(req.query.limit, 10) || 24, 100);
    const paginate = Number.isFinite(page) && page > 0;

    const mongoQuery = Release.find(query).sort(sortSpec);
    if (paginate) mongoQuery.skip((page - 1) * limit).limit(limit);

    const items = await mongoQuery.lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};
