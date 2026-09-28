const Submission = require("../models/Submission");

exports.createSubmission = async (req, res, next) => {
  try {
    const { title, category, fandom, body, imageUrl } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required." });
    }
    if (!category || !String(category).trim()) {
      return res.status(400).json({ message: "Category is required." });
    }
    if (!body || String(body).trim().length < 20) {
      return res.status(400).json({ message: "Body needs at least 20 characters." });
    }

    const submission = await Submission.create({
      userId: req.user.id,
      title: String(title).trim(),
      category: String(category).trim(),
      fandom,
      body: String(body).trim(),
      imageUrl: imageUrl ? String(imageUrl) : "",
    });

    res.status(201).json({ submission });
  } catch (err) {
    next(err);
  }
};

exports.getMySubmissions = async (req, res, next) => {
  try {
    const items = await Submission.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};
