const mongoose = require("mongoose");
const { searchCondition } = require("../utils/search");

function coerce(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

function createCrudController({
  Model,
  filterKeys = [],
  searchable = [],
  sortDefault = { createdAt: -1 },
  bulk = {},
  prepareBody = null,
}) {
  const getAll = async (req, res, next) => {
    try {
      const query = {};
      for (const key of filterKeys) {
        if (req.query[key] !== undefined && req.query[key] !== "all") {
          query[key] = coerce(req.query[key]);
        }
      }
      const cond = searchCondition(req.query.search, searchable);
      if (cond) Object.assign(query, cond);

      const page = parseInt(req.query.page, 10);
      const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
      const paginate = Number.isFinite(page) && page > 0;

      const mongoQuery = Model.find(query).sort(sortDefault);
      if (paginate) mongoQuery.skip((page - 1) * limit).limit(limit);

      const items = await mongoQuery.lean();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  };

  const create = async (req, res, next) => {
    try {
      const body = prepareBody ? prepareBody(req.body || {}) : req.body || {};
      const item = await Model.create(body);
      res.status(201).json({ item });
    } catch (err) {
      next(err);
    }
  };

  const update = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid id." });
      }
      const existing = prepareBody ? await Model.findById(id).lean() : null;
      if (prepareBody && !existing) return res.status(404).json({ message: "Item not found." });
      const body = prepareBody ? prepareBody(req.body || {}, existing) : req.body || {};
      const item = await Model.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: "query",
      });
      if (!item) return res.status(404).json({ message: "Item not found." });
      res.json(item);
    } catch (err) {
      next(err);
    }
  };

  const remove = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid id." });
      }
      const item = await Model.findByIdAndDelete(id);
      if (!item) return res.status(404).json({ message: "Item not found." });
      res.json({ message: "Deleted." });
    } catch (err) {
      next(err);
    }
  };

  const bulkAction = async (req, res, next) => {
    try {
      const { action, ids } = req.body || {};

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "ids must be a non-empty array." });
      }
      if (!ids.every((id) => mongoose.isValidObjectId(id))) {
        return res.status(400).json({ message: "One or more ids are invalid." });
      }
      const op = bulk[action];
      if (!op) {
        return res
          .status(400)
          .json({ message: `action must be one of: ${Object.keys(bulk).join(", ")}.` });
      }

      if (op === "delete") {
        const result = await Model.deleteMany({ _id: { $in: ids } });
        return res.json({ message: `Deleted ${result.deletedCount} item(s).`, count: result.deletedCount });
      }

      const result = await Model.updateMany({ _id: { $in: ids } }, { $set: op });
      return res.json({
        message: `${action} applied to ${result.modifiedCount} item(s).`,
        count: result.modifiedCount,
      });
    } catch (err) {
      next(err);
    }
  };

  return { getAll, create, update, remove, bulkAction };
}

module.exports = { createCrudController };
