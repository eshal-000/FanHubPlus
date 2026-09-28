const jwt = require("jsonwebtoken");
const Feedback = require("../models/Feedback");
const User = require("../models/User");

exports.createFeedback = async (req, res, next) => {
  try {
    const { type, subject, message, name, email, rating } = req.body || {};

    if (!["bug", "suggestion", "query"].includes(type)) {
      return res.status(400).json({ message: "type must be bug, suggestion or query." });
    }
    if (!subject || !String(subject).trim()) {
      return res.status(400).json({ message: "Subject is required." });
    }
    if (!message || String(message).trim().length < 10) {
      return res.status(400).json({ message: "Message needs at least 10 characters." });
    }

    let authUser = null;
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        authUser = await User.findById(decoded.id).select("name email");
      } catch {

      }
    }

    const safeRating =
      rating === null || rating === undefined || rating === ""
        ? null
        : Math.min(5, Math.max(1, Math.round(Number(rating) || 0))) || null;

    const feedback = await Feedback.create({
      type,
      subject: String(subject).trim(),
      message: String(message).trim(),
      rating: safeRating,
      userId: authUser ? authUser._id : undefined,
      name: authUser ? authUser.name : name ? String(name).trim().slice(0, 80) : "Guest",
      email: authUser ? authUser.email : email ? String(email).toLowerCase().trim() : "",
    });

    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
};
