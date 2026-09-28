const Character = require("../models/Character");
const Article = require("../models/Article");
const Media = require("../models/Media");
const Merch = require("../models/Merch");
const { searchCondition } = require("../utils/search");

const SORTS = { name: { name: 1 }, "-createdAt": { createdAt: -1 }, oldest: { createdAt: 1 } };

exports.getCharacters = async (req, res, next) => {
  try {
    const { search, fandom, category, sort } = req.query;

    const query = {};
    if (fandom) query.fandom = fandom;
    if (category) query.category = category;

    const cond = searchCondition(search, ["name", "bio", "traits"]);
    if (cond) Object.assign(query, cond);

    const sortSpec = SORTS[sort] || SORTS.name;

    const page = parseInt(req.query.page, 10);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 100);
    const paginate = Number.isFinite(page) && page > 0;

    const mongoQuery = Character.find(query).sort(sortSpec);
    if (paginate) mongoQuery.skip((page - 1) * limit).limit(limit);

    const items = await mongoQuery.lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.getCharacterById = async (req, res, next) => {
  try {
    const character = await Character.findById(req.params.id).lean();
    if (!character) return res.status(404).json({ message: "Character not found." });

    const related = { articles: [], media: [], merch: [] };

    if (character.relatedContent?.length) {

      const idsByKind = {};
      for (const rc of character.relatedContent) {
        (idsByKind[rc.kind] = idsByKind[rc.kind] || []).push(rc.item);
      }
      await Promise.all([
        idsByKind.article?.length
          ? Article.find({ _id: { $in: idsByKind.article }, status: "published" }).limit(6).lean().then((d) => (related.articles = d))
          : null,
        idsByKind.media?.length
          ? Media.find({ _id: { $in: idsByKind.media } }).limit(6).lean().then((d) => (related.media = d))
          : null,
        idsByKind.merch?.length
          ? Merch.find({ _id: { $in: idsByKind.merch } }).limit(6).lean().then((d) => (related.merch = d))
          : null,
      ]);
    } else {

      const fandom = character.fandom;
      const [articles, media, merch] = await Promise.all([
        Article.find({ fandom, status: "published" }).sort({ publishedAt: -1 }).limit(3).lean(),
        Media.find({ fandom }).sort({ createdAt: -1 }).limit(3).lean(),
        Merch.find({ fandom }).sort({ createdAt: -1 }).limit(3).lean(),
      ]);
      related.articles = articles;
      related.media = media;
      related.merch = merch;
    }

    res.json({ character, relatedContent: related });
  } catch (err) {
    next(err);
  }
};
