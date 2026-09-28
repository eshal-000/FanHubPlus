const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "7d" }
  );
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required." });
    }
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      return res.status(400).json({ message: "A valid email is required." });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash: String(password),
    });

    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
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

    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const generic = {
      message: "If that email exists, a password reset link has been sent.",
    };

    if (!email || !EMAIL_RE.test(String(email).trim())) return res.json(generic);

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.json(generic);

    const token = crypto.randomBytes(24).toString("hex");
    user.passwordResetTokenHash = sha256(token);
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    console.log(
      `\n📧 Password reset for ${user.email}\n   Reset endpoint: POST /api/auth/reset/${token}\n   (valid 15 min)\n`
    );

    res.json(generic);
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body || {};
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const hashed = sha256(String(req.params.token));
    const user = await User.findOne({
      passwordResetTokenHash: hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordHash");

    if (!user) {
      return res.status(400).json({ message: "Reset token is invalid or has expired." });
    }

    user.passwordHash = String(password);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful — you can now log in." });
  } catch (err) {
    next(err);
  }
};
