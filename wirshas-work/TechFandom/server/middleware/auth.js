const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : header.trim();

    if (!token) {
      return res.status(401).json({ message: "Not authorized — no token provided." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const msg =
        err.name === "TokenExpiredError"
          ? "Session expired — please log in again."
          : "Not authorized — token is invalid.";
      return res.status(401).json({ message: msg });
    }

    const user = await User.findById(decoded.id).select("role email name lastActive");
    if (!user) {
      return res.status(401).json({ message: "Account no longer exists." });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    User.findByIdAndUpdate(user._id, { lastActive: new Date() }).catch(() => {});

    next();
  } catch (err) {
    next(err);
  }
};
