const mongoose = require('mongoose')

const castMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    characterName: { type: String, trim: true },
    imageUrl: { type: String },
    bio: { type: String },
    dateOfBirth: { type: Date },
    nationality: { type: String, trim: true },
    notableWorks: { type: [String], default: [] },

    characterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
  },
  { _id: true },
)

const mediaSchema = new mongoose.Schema(
  {

    category: { required: true, trim: true, type: String },
    embedUrl: { required: true, trim: true, type: String },
    fandom: { required: true, trim: true, type: String },
    mediaType: {
      enum: ['video', 'trailer', 'audio', 'explainer'],
      required: true,
      type: String,
    },
    releaseYear: Number,
    tags: { default: [], type: [String] },
    thumbnailUrl: String,
    title: { required: true, trim: true, type: String },


    bannerUrl: { type: String, trim: true },
    posterUrl: { type: String, trim: true },
    galleryUrls: { type: [String], default: [] },


    synopsis: { type: String },
    genres: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    country: { type: String, trim: true },
    runtimeMinutes: { type: Number, min: 0 },
    releaseDate: { type: Date },


    director: { type: String, trim: true },
    writers: { type: [String], default: [] },
    producers: { type: [String], default: [] },
    studios: { type: [String], default: [] },
    distributor: { type: String, trim: true },


    budgetUsd: { type: Number, min: 0 },
    boxOfficeUsd: { type: Number, min: 0 },


    cast: { type: [castMemberSchema], default: [] },


    awards: { type: [String], default: [] },
    trivia: { type: [String], default: [] },
    soundtrack: { type: [String], default: [] },


    filmingStartDate: { type: Date },
    filmingEndDate: { type: Date },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Media', mediaSchema)