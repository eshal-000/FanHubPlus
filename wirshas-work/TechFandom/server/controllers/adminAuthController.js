const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
      "+passwordHash"
    );
    if (!user || !(await user.comparePassword(String(password)))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "This account does not have admin access." });
    }

    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};
