const mongoose = require('mongoose')

const contributorSchema = new mongoose.Schema(
  {
    name: { default: '', trim: true, type: String },
    role: { default: '', trim: true, type: String },
    characterName: { default: '', trim: true, type: String },
    imageUrl: { default: '', trim: true, type: String },
    bio: { default: '', type: String },
  },
  { _id: false },
)

const externalLinkSchema = new mongoose.Schema(
  {
    label: { default: '', trim: true, type: String },
    url: { default: '', trim: true, type: String },
    type: { default: 'reference', trim: true, type: String },
  },
  { _id: false },
)

const featuredMediaSchema = new mongoose.Schema(
  {
    description: { default: '', type: String },
    thumbnailUrl: { default: '', trim: true, type: String },
    title: { default: '', trim: true, type: String },
    type: {
      default: 'image',
      enum: ['image', 'youtube', 'audio', 'external'],
      type: String,
    },
    url: { default: '', trim: true, type: String },
  },
  { _id: false },
)

const featuredSongSchema = new mongoose.Schema(
  {
    description: { default: '', type: String },
    title: { default: '', trim: true, type: String },
    youtubeUrl: { default: '', trim: true, type: String },
  },
  { _id: false },
)

const descriptionPanelSchema = new mongoose.Schema(
  {
    body: { default: '', type: String },
    items: { default: [], type: [String] },
    title: { default: '', trim: true, type: String },
  },
  { _id: false },
)

const animeVoiceSchema = new mongoose.Schema(
  {
    audioUrl: { default: '', trim: true, type: String },
    characterName: { default: '', trim: true, type: String },
    imageUrl: { default: '', trim: true, type: String },
    notes: { default: '', type: String },
    rightsStatus: {
      default: 'unknown',
      enum: ['unknown', 'needs-review', 'cleared', 'restricted'],
      type: String,
    },
    seriesName: { default: '', trim: true, type: String },
    sourceFile: { default: '', trim: true, type: String },
  },
  { _id: false },
)

const detailSchema = new mongoose.Schema(
  {
    alternateTitles: { default: [], type: [String] },
    availability: { default: '', type: String },
    accessories: { default: [], type: [String] },
    agency: { default: '', type: String },
    bannerUrl: { default: '', type: String },
    characters: { default: [], type: [String] },
    clothing: { default: [], type: [String] },
    country: { default: '', trim: true, type: String },
    coverUrl: { default: '', type: String },
    creators: { default: [], type: [String] },
    debutDate: { default: '', type: String },
    developer: { default: '', type: String },
    director: { default: '', trim: true, type: String },
    directorBio: { default: '', type: String },
    directorPhoto: { default: '', type: String },
    duration: { default: '', trim: true, type: String },
    episodes: { min: 0, type: Number },
    features: { default: [], type: [String] },
    formats: { default: [], type: [String] },
    featuredMedia: { default: () => ({}), type: featuredMediaSchema },
    featuredSong: { default: () => ({}), type: featuredSongSchema },
    descriptionPanels: { default: [], type: [descriptionPanelSchema] },
    genres: { default: [], type: [String] },
    heroImage: { default: '', type: String },
    languages: { default: [], type: [String] },
    materials: { default: [], type: [String] },
    notablePublications: { default: [], type: [String] },
    officialMediaUrl: { default: '', type: String },
    origin: { default: '', trim: true, type: String },
    originalTitle: { default: '', type: String },
    outfitConcept: { default: '', type: String },
    platforms: { default: [], type: [String] },
    publisher: { default: '', trim: true, type: String },
    posterUrl: { default: '', type: String },
    ratingSystem: { default: '', trim: true, type: String },
    runtimeMinutes: { min: 0, type: Number },
    seasons: { min: 0, type: Number },
    selectedReleases: { default: [], type: [String] },
    sourceNotes: { default: '', type: String },
    studios: { default: [], type: [String] },
    stylingIdeas: { default: [], type: [String] },
    subtitle: { default: '', type: String },
    trailerUrl: { default: '', trim: true, type: String },
    animeVoices: { default: [], type: [animeVoiceSchema] },
    volumes: { min: 0, type: Number },
    websiteUrl: { default: '', trim: true, type: String },
    yearLabel: { default: '', trim: true, type: String },
  },
  { _id: false, strict: false },
)

const contentSchema = new mongoose.Schema(
  {
    body: { default: '', type: String },
    category: { default: '', type: String },
    categorySlug: { required: true, type: String },
    collectionKey: { default: '', trim: true, type: String },
    contributors: { default: [], type: [contributorSchema] },
    description: { default: '', type: String },
    details: { default: () => ({}), type: detailSchema },
    externalLinks: { default: [], type: [externalLinkSchema] },
    fandom: { default: '', type: String },
    imageUrl: { default: '', type: String },
    imageUrls: { default: [], type: [String] },
    likes: { default: 0, type: Number },
    popularity: { default: 0, type: Number },
    publishedAt: { type: Date },
    rating: { default: null, max: 5, min: 0, type: Number },
    relatedContent: { default: [], ref: 'Content', type: [mongoose.Schema.Types.ObjectId] },
    releaseDate: { type: Date },
    releaseYear: { type: Number },
    slug: { default: '', type: String },
    sourceSubmissionId: { default: null, ref: 'Submission', type: mongoose.Schema.Types.ObjectId },
    status: { default: 'published', enum: ['draft', 'published', 'archived'], type: String },
    submittedBy: { default: null, ref: 'User', type: mongoose.Schema.Types.ObjectId },
    tags: { default: [], type: [String] },
    title: { required: true, trim: true, type: String },
    type: {
      enum: [
        'article',
        'video',
        'audio',
        'image',
        'gallery',
        'review',
        'news',
        'anime',
        'game',
        'movie',
        'tv-show',
        'k-pop',
        'comic',
        'manga',
        'cosplay',
      ],
      required: true,
      type: String,
    },
    videoUrl: { default: '', type: String },
    views: { default: 0, type: Number },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Content', contentSchema)
