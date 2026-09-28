const CATEGORY_LABELS = {
  anime: "Anime",
  comics: "Comics",
  cosplay: "Cosplay",
  gaming: "Gaming",
  "k-pop": "K-Pop",
  manga: "Manga",
  movies: "Movies",
  music: "Music",
  sports: "Sports",
  "tv-shows": "TV Shows",
};

function toCategorySlug(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const lower = text.toLowerCase();
  if (["k-pop", "k pop", "kpop"].includes(lower)) return "k-pop";
  if (["tv-shows", "tv shows", "television"].includes(lower)) return "tv-shows";

  return lower
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryAliases(value) {
  const slug = toCategorySlug(value);
  return [...new Set([value, slug, CATEGORY_LABELS[slug]].filter(Boolean))];
}

module.exports = {
  CATEGORY_LABELS,
  categoryAliases,
  toCategorySlug,
};
