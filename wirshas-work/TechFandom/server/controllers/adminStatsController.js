const User = require("../models/User");
const Content = require("../models/Content");
const Character = require("../models/Character");
const Article = require("../models/Article");
const Media = require("../models/Media");
const Event = require("../models/Event");
const Release = require("../models/Release");
const Merch = require("../models/Merch");
const Feedback = require("../models/Feedback");

exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const [
      activeUsersDocs,
      characterCount,
      articleCount,
      contentCount,
      mediaCount,
      eventCount,
      releaseCount,
      merchCount,
      upcomingEvents,
      pendingFeedback,
    ] = await Promise.all([
      User.find({ lastActive: { $gte: since } }).select("lastActive").lean(),
      Character.countDocuments(),
      Article.countDocuments(),
      Content.countDocuments(),
      Media.countDocuments(),
      Event.countDocuments(),
      Release.countDocuments(),
      Merch.countDocuments(),
      Event.countDocuments({ startDate: { $gt: now } }),
      Feedback.countDocuments({ status: "open" }),
    ]);

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        key: d.toISOString().slice(0, 10),
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        users: 0,
      });
    }
    const dayIndex = new Map(days.map((d) => [d.key, d]));
    for (const u of activeUsersDocs) {
      const key = new Date(u.lastActive).toISOString().slice(0, 10);
      const bucket = dayIndex.get(key);
      if (bucket) bucket.users += 1;
    }
    const activeUsers = days.map(({ day, users }) => ({ day, users }));

    let catAgg = await Content.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    if (!catAgg.length) {
      catAgg = await Character.aggregate([
        { $group: { _id: "$fandom", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]);
    }
    const popularCategories = catAgg.map((c) => ({ category: c._id, count: c.count }));
    const trendingCategory = popularCategories[0]?.category || null;

    res.json({
      activeUsersCount: activeUsersDocs.length,
      totalContent:
        characterCount + articleCount + contentCount + mediaCount + eventCount + releaseCount + merchCount,
      upcomingEvents,
      pendingFeedback,
      activeUsers,
      popularCategories,
      trendingCategory,
    });
  } catch (err) {
    next(err);
  }
};
