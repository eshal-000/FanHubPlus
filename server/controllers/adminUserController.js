const mongoose = require("mongoose");
const User = require("../models/User");
const Bookmark = require("../models/Bookmark");
const Feedback = require("../models/Feedback");
const Media = require("../models/Media");
const Merch = require("../models/Merch");
const Article = require("../models/Article");
const Character = require("../models/Character");
const Content = require("../models/Content");
const Submission = require("../models/Submission");

const ACTIVITY_CAP = 5;

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();

    const bookmarks = await Bookmark.find().sort({ createdAt: -1 }).limit(500).lean();
    const idsByType = {};
    for (const b of bookmarks) {
      (idsByType[b.itemType] = idsByType[b.itemType] || []).push(b.itemId);
    }
    const titleByType = {};
    await Promise.all(
      Object.entries(idsByType).map(async ([type, ids]) => {
        const Model = {
          article: Article,
          character: Character,
          content: Content,
          media: Media,
          merch: Merch,
          merchandise: Merch,
          video: Content,
        }[type];
        if (!Model) return;
        const docs = await Model.find({ _id: { $in: ids } })
          .select("title name")
          .lean();
        titleByType[type] = new Map(docs.map((d) => [String(d._id), d.title || d.name || "Item"]));
      })
    );
    const bookmarkByUser = new Map();
    for (const b of bookmarks) {
      const title = titleByType[b.itemType]?.get(String(b.itemId)) || "Item";
      const entry = { itemType: b.itemType, title, createdAt: b.createdAt };
      const key = String(b.userId);
      if (!bookmarkByUser.has(key)) bookmarkByUser.set(key, []);
      if (bookmarkByUser.get(key).length < ACTIVITY_CAP) bookmarkByUser.get(key).push(entry);
    }

    const [feedbacks, submissions] = await Promise.all([
      Feedback.find({ userId: { $ne: null } })
        .select("subject status type userId createdAt")
        .sort({ createdAt: -1 })
        .limit(500)
        .lean(),
      Submission.find({ userId: { $ne: null } })
        .select("title status category fandom userId createdAt")
        .sort({ createdAt: -1 })
        .limit(500)
        .lean(),
    ]);

    const feedbackByUser = new Map();
    for (const f of feedbacks) {
      const key = String(f.userId);
      if (!feedbackByUser.has(key)) feedbackByUser.set(key, []);
      if (feedbackByUser.get(key).length < ACTIVITY_CAP)
        feedbackByUser
          .get(key)
          .push({ subject: f.subject, type: f.type, status: f.status, createdAt: f.createdAt });
    }

    const submissionByUser = new Map();
    for (const s of submissions) {
      const key = String(s.userId);
      if (!submissionByUser.has(key)) submissionByUser.set(key, []);
      if (submissionByUser.get(key).length < ACTIVITY_CAP)
        submissionByUser
          .get(key)
          .push({ title: s.title, category: s.category, fandom: s.fandom, status: s.status, createdAt: s.createdAt });
    }

    const items = users.map((u) => ({
      ...u,
      recentBookmarks: bookmarkByUser.get(String(u._id)) || [],
      recentSubmissions: submissionByUser.get(String(u._id)) || [],
      recentFeedback: feedbackByUser.get(String(u._id)) || [],
    }));

    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id." });
    }
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: 'role must be "user" or "admin".' });
    }
    if (String(id) === req.user.id && role !== "admin") {
      return res.status(400).json({ message: "You cannot demote your own account." });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true, context: "query" }
    );
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json(user);
  } catch (err) {
    next(err);
  }
};
