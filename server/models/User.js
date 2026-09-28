const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const displayPreferencesSchema = new mongoose.Schema(
  {
    fontScale: {
      default: 'normal',
      enum: ['normal', 'large', 'xlarge'],
      type: String,
    },
    emailUpdates: {
      default: true,
      type: Boolean,
    },
    reduceMotion: {
      default: false,
      type: Boolean,
    },
    theme: {
      default: 'dark',
      enum: ['dark', 'light', 'system'],
      type: String,
    },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema(
  {
    avatarUrl: String,
    displayPreferences: {
      default: () => ({}),
      type: displayPreferencesSchema,
    },
    email: {
      lowercase: true,
      required: true,
      trim: true,
      type: String,
      unique: true,
    },
    favoriteFandoms: {
      default: [],
      type: [String],
    },
    interests: {
      default: [],
      type: [String],
    },
    lastActive: {
      default: Date.now,
      type: Date,
    },
    name: {
      required: true,
      trim: true,
      type: String,
    },
    passwordHash: {
      select: false,
      required: true,
      type: String,
    },
    passwordResetExpires: Date,
    passwordResetTokenHash: String,
    role: {
      default: 'user',
      enum: ['user', 'admin'],
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash
        delete ret.__v
        return ret
      },
    },
  },
)

userSchema.index({ role: 1, createdAt: -1 })

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('passwordHash')) {
    return
  }

  this.passwordHash = await bcrypt.hash(this.passwordHash, 10)
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash)
}

userSchema.methods.matchPassword = userSchema.methods.comparePassword

module.exports = mongoose.model('User', userSchema)
