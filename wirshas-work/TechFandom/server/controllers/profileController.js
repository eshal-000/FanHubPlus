const User = require("../models/User");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const { name, favoriteFandoms, interests, displayPreferences, avatarUrl } = req.body || {};

    if (name !== undefined) user.name = String(name).trim().slice(0, 60);

    if (favoriteFandoms !== undefined) {
      user.favoriteFandoms = Array.isArray(favoriteFandoms)
        ? favoriteFandoms
        : String(favoriteFandoms).split(",").map((s) => s.trim()).filter(Boolean);
    }

    if (interests !== undefined) {
      user.interests = Array.isArray(interests)
        ? interests
        : String(interests).split(",").map((s) => s.trim()).filter(Boolean);
    }

    if (avatarUrl !== undefined) user.avatarUrl = String(avatarUrl);

    if (displayPreferences && typeof displayPreferences === "object") {
      const allowed = ["theme", "reduceMotion", "emailUpdates"];
      for (const key of allowed) {
        if (key in displayPreferences) user.displayPreferences[key] = displayPreferences[key];
      }
    }

    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
