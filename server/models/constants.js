

const FANDOMS = ["Anime", "Gaming", "Movies", "TV Shows", "K-Pop", "Comics", "Manga", "Cosplay"];

const CHARACTER_CATEGORIES = [
  "Protagonist",
  "Antagonist",
  "Supporting",
  "Idol",
  "Mentor",
  "Rival",
  "Comic Relief",
  "Legendary",
];

const ARTICLE_CATEGORIES = [
  "Reviews",
  "Theories",
  "News",
  "Interviews",
  "Guides",
  "Opinion",
  "Fan Fiction",
  "Editorials",
];

const CONTENT_TYPES = [
  "article",
  "video",
  "audio",
  "image",
  "gallery",
  "review",
  "news",
  "anime",
  "game",
  "movie",
  "tv-show",
  "k-pop",
  "comic",
  "manga",
  "cosplay",
];
const MEDIA_TYPES = ["video", "audio", "explainer"];

const EVENT_TYPES = ["convention", "premiere", "screening", "cosplay-meetup"];

const RELEASE_TYPES = ["anime", "game", "movie", "show", "comic", "manga", "k-pop", "cosplay", "merch"];
const RELEASE_STATUSES = ["upcoming", "released", "delayed"];

const ARTICLE_STATUSES = ["draft", "published", "archived"];
const SUBMISSION_STATUSES = ["pending", "approved", "rejected", "published"];

const FEEDBACK_TYPES = ["bug", "suggestion", "query"];
const FEEDBACK_STATUSES = ["open", "in-progress", "resolved"];

const BOOKMARK_ITEM_TYPES = ["article", "character", "content", "video", "media", "merch", "merchandise"];

const MERCH_TAGS = ["Limited Edition", "Pre-Order", "Collectible", "Exclusive", "Restock"];
const MERCH_CATEGORIES = [
  "Apparel",
  "Figures",
  "Posters",
  "Accessories",
  "Plushies",
  "Collectibles",
  "Stationery",
  "Vinyl",
];

function makeSlug(title) {
  const base = String(title || "item")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `${base || "item"}-${suffix}`;
}

module.exports = {
  FANDOMS,
  CHARACTER_CATEGORIES,
  ARTICLE_CATEGORIES,
  CONTENT_TYPES,
  MEDIA_TYPES,
  EVENT_TYPES,
  RELEASE_TYPES,
  RELEASE_STATUSES,
  ARTICLE_STATUSES,
  SUBMISSION_STATUSES,
  FEEDBACK_TYPES,
  FEEDBACK_STATUSES,
  BOOKMARK_ITEM_TYPES,
  MERCH_TAGS,
  MERCH_CATEGORIES,
  makeSlug,
};
