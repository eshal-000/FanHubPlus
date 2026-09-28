const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const FANDOMS = ["Gaming", "K-Pop", "Anime", "Movies", "Music", "Comics", "Sports"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    favoriteFandoms: [{ type: String, enum: FANDOMS }],
    interests: [{ type: String, trim: true }],
    displayPreferences: {
      theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
      reduceMotion: { type: Boolean, default: false },
      emailUpdates: { type: Boolean, default: true },
    },
    avatarUrl: { type: String, default: "" },
    lastActive: { type: Date, default: Date.now },

    resetPasswordToken: { type: String, select: false, default: undefined },
    resetPasswordExpires: { type: Date, select: false, default: undefined },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

userSchema.index({ role: 1, createdAt: -1 });

userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.matchPassword = userSchema.methods.comparePassword;

userSchema.methods.touchLastActive = function () {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model("User", userSchema);