const Article = require("../models/Article");
const { searchCondition } = require("../utils/search");

const SORTS = {
  "-publishedAt": { publishedAt: -1 },
  "-views": { views: -1 },
  title: { title: 1 },
};

exports.getArticles = async (req, res, next) => {
  try {
    const { search, fandom, category, sort, featured } = req.query;

    const query = { status: "published" }; 
    if (fandom) query.fandom = fandom;
    if (category) query.category = category;
    if (featured === "true") query.featured = true;

    const cond = searchCondition(search, ["title", "excerpt", "author"]);
    if (cond) Object.assign(query, cond);

    const sortSpec = SORTS[sort] || SORTS["-publishedAt"];

    const page = parseInt(req.query.page, 10);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
    const paginate = Number.isFinite(page) && page > 0;

    const mongoQuery = Article.find(query).sort(sortSpec);
    if (paginate) mongoQuery.skip((page - 1) * limit).limit(limit);

    const items = await mongoQuery.lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findOne({ _id: req.params.id }).lean();
    if (!article) return res.status(404).json({ message: "Article not found." });

    Article.updateOne({ _id: article._id }, { $inc: { views: 1 } }).catch(() => {});

    const relatedArticles = await Article.find({
      _id: { $ne: article._id },
      status: "published",
      $or: [{ fandom: article.fandom }, { category: article.category }],
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    res.json({ article, relatedArticles });
  } catch (err) {
    next(err);
  }
};
