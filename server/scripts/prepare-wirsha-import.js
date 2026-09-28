const fs = require("fs");
const path = require("path");

const { toCategorySlug } = require("../utils/category");

const repoRoot = path.resolve(__dirname, "..", "..");
const defaultSource = path.join(repoRoot, "wirshas-db", "fanhubplus-backup");
const defaultOut = path.join(
  repoRoot,
  "database-import-prep",
  new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, ""),
);

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i], process.argv[i + 1]);
}

const sourceDir = path.resolve(args.get("--source") || defaultSource);
const outDir = path.resolve(args.get("--out") || defaultOut);

const COLLECTIONS = [
  "articles",
  "bookmarks",
  "characters",
  "contents",
  "events",
  "feedbacks",
  "media",
  "merches",
  "ratings",
  "releases",
  "submissions",
  "users",
];

const USER_BOUND_COLLECTIONS = ["bookmarks", "feedbacks", "ratings", "submissions"];

function readExport(name) {
  const filePath = path.join(sourceDir, `fanhubplus.${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing export file: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(relativePath, value) {
  const target = path.join(outDir, relativePath);
  ensureDir(path.dirname(target));
  fs.writeFileSync(`${target}.json`, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const target = path.join(outDir, relativePath);
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, value);
}

function oid(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.$oid || "";
}

function oidObject(id) {
  return id ? { $oid: id } : undefined;
}

function dateObject(value) {
  if (!value) return undefined;
  if (value.$date) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : { $date: date.toISOString() };
}

function plain(value, fallback = "") {
  return value == null ? fallback : value;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function duplicateValues(values) {
  const seen = new Set();
  const dupes = new Set();
  for (const value of values.filter(Boolean)) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes].sort();
}

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function enumOr(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function collectionIdSet(docs) {
  return new Set(docs.map((doc) => oid(doc._id)).filter(Boolean));
}

function transformContent(doc) {
  const categorySlug = toCategorySlug(doc.category);
  const releaseDate = dateObject(doc.releaseDate);
  const releaseYear = releaseDate?.$date ? new Date(releaseDate.$date).getUTCFullYear() : 2025;
  return {
    ...doc,
    body: plain(doc.body, doc.description || ""),
    category: plain(doc.category),
    categorySlug,
    fandom: plain(doc.fandom, doc.category || ""),
    imageUrl: plain(doc.imageUrl),
    releaseDate,
    releaseYear,
    status: "published",
    type: enumOr(doc.type, ["article", "video", "audio", "image", "gallery", "review", "news"], "article"),
    videoUrl: plain(doc.videoUrl),
  };
}

function transformArticle(doc) {
  const imageUrls = asArray(doc.imageUrls);
  return {
    ...doc,
    category: plain(doc.category),
    categorySlug: toCategorySlug(doc.fandom || doc.category),
    fandom: plain(doc.fandom),
    imageUrl: plain(doc.imageUrl, imageUrls[0] || ""),
    imageUrls,
    readTime: doc.readTime || "5 min read",
    status: enumOr(doc.status, ["draft", "published", "archived"], "published") === "archived" ? "draft" : enumOr(doc.status, ["draft", "published"], "published"),
    tags: unique([doc.category, doc.fandom, ...(doc.tags || [])]),
  };
}

function transformCharacter(doc, validTargets, removedRelated) {
  const relatedContent = [];
  for (const item of doc.relatedContent || []) {
    const kind = item.kind;
    const itemId = oid(item.item);
    const target = validTargets[kind];
    if (!target || !target.has(itemId)) {
      removedRelated.push({
        characterId: oid(doc._id),
        characterName: doc.name,
        kind,
        itemId,
        reason: "missing referenced document in supplied exports",
      });
      continue;
    }
    relatedContent.push({ kind, item: oidObject(itemId) });
  }

  return {
    ...doc,
    abilities: asArray(doc.abilities?.length ? doc.abilities : doc.traits),
    category: plain(doc.category),
    categorySlug: toCategorySlug(doc.fandom || doc.category),
    fandom: plain(doc.fandom),
    imageUrl: plain(doc.imageUrl, doc.image || ""),
    relatedContent,
    series: plain(doc.series, doc.fandom || ""),
    status: "published",
    tags: unique([doc.fandom, doc.category, ...(doc.traits || []), ...(doc.tags || [])]),
    title: plain(doc.title, doc.category || ""),
    traits: asArray(doc.traits),
  };
}

function transformBookmark(doc) {
  return {
    ...doc,
    itemType: doc.itemType === "merchandise" ? "merch" : doc.itemType,
    note: doc.note || "",
  };
}

function transformSubmission(doc) {
  return {
    ...doc,
    imageUrl: plain(doc.imageUrl),
    status: enumOr(doc.status, ["pending", "approved", "rejected", "published"], "pending"),
  };
}

function transformFeedback(doc) {
  return {
    ...doc,
    status: enumOr(doc.status, ["open", "in-progress", "resolved"], "open"),
    type: enumOr(doc.type, ["bug", "suggestion", "query"], "query"),
  };
}

function referenceReport(exports) {
  const ids = Object.fromEntries(COLLECTIONS.map((name) => [name, collectionIdSet(exports[name])]));
  const report = {
    bookmarks: { total: exports.bookmarks.length, valid: [], excluded: [] },
    ratings: { total: exports.ratings.length, valid: [], excluded: [] },
    submissions: { total: exports.submissions.length, valid: [], excluded: [] },
    feedbacks: { total: exports.feedbacks.length, valid: [], excluded: [] },
  };

  const bookmarkTargets = {
    article: ids.articles,
    character: ids.characters,
    content: ids.contents,
    media: ids.media,
    merch: ids.merches,
    merchandise: ids.merches,
    video: ids.contents,
  };

  for (const bookmark of exports.bookmarks) {
    const userId = oid(bookmark.userId);
    const itemId = oid(bookmark.itemId);
    const target = bookmarkTargets[bookmark.itemType];
    const problems = [];
    if (!ids.users.has(userId)) problems.push("missing exported userId");
    if (!target) problems.push(`unsupported itemType ${bookmark.itemType}`);
    if (target && !target.has(itemId)) problems.push("missing referenced itemId");
    const entry = { _id: oid(bookmark._id), userId, itemType: bookmark.itemType, itemId, problems };
    (problems.length ? report.bookmarks.excluded : report.bookmarks.valid).push(entry);
  }

  for (const rating of exports.ratings) {
    const userId = oid(rating.userId);
    const mediaId = oid(rating.mediaId);
    const problems = [];
    if (!ids.users.has(userId)) problems.push("missing exported userId");
    if (!ids.media.has(mediaId)) problems.push("missing referenced mediaId");
    const entry = { _id: oid(rating._id), userId, mediaId, problems };
    (problems.length ? report.ratings.excluded : report.ratings.valid).push(entry);
  }

  for (const submission of exports.submissions) {
    const userId = oid(submission.userId);
    const problems = [];
    if (!ids.users.has(userId)) problems.push("missing exported userId");
    const entry = { _id: oid(submission._id), userId, problems };
    (problems.length ? report.submissions.excluded : report.submissions.valid).push(entry);
  }

  for (const feedback of exports.feedbacks) {
    const userId = oid(feedback.userId);
    const problems = [];
    if (userId && !ids.users.has(userId)) problems.push("missing exported userId");
    const entry = { _id: oid(feedback._id), userId: userId || null, problems };
    (problems.length ? report.feedbacks.excluded : report.feedbacks.valid).push(entry);
  }

  return report;
}

function duplicateReport(exports, transformed) {
  const report = {};
  for (const [name, docs] of Object.entries(exports)) {
    report[name] = {
      duplicateIds: duplicateValues(docs.map((doc) => oid(doc._id))),
    };
  }

  report.users.duplicateEmails = duplicateValues(exports.users.map((doc) => String(doc.email || "").toLowerCase()));
  report.bookmarks.duplicateUniqueKeys = duplicateValues(
    transformed.bookmarks.valid.map((doc) => `${oid(doc.userId)}:${doc.itemType}:${oid(doc.itemId)}`),
  );
  report.ratings.duplicateUniqueKeys = duplicateValues(
    transformed.ratings.valid.map((doc) => `${oid(doc.userId)}:${oid(doc.mediaId)}`),
  );
  report.articles.duplicateSlugs = duplicateValues(transformed.articles.map((doc) => doc.slug));
  report.contents.duplicateSlugs = duplicateValues(transformed.contents.map((doc) => doc.slug));
  report.merches.duplicateNames = duplicateValues(transformed.merches.map((doc) => doc.name));
  report.media.duplicateTitles = duplicateValues(transformed.media.map((doc) => doc.title));
  return report;
}

function summarizeSchemas(exports) {
  const summary = {};
  for (const [name, docs] of Object.entries(exports)) {
    const keys = [...new Set(docs.flatMap((doc) => Object.keys(doc)))].sort();
    summary[name] = { count: docs.length, keys };
  }
  return summary;
}

function markdownReport(report) {
  const lines = [];
  lines.push("# Wirsha Database Import Prep");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Source: ${report.sourceDir}`);
  lines.push("");
  lines.push("## Proposed Import Order");
  for (const [index, item] of report.proposedImportOrder.entries()) {
    lines.push(`${index + 1}. ${item.collection}: ${item.count} candidate docs - ${item.note}`);
  }
  lines.push("");
  lines.push("## Counts");
  for (const [name, info] of Object.entries(report.collectionCounts)) {
    lines.push(`- ${name}: source ${info.source}, transformed ${info.transformed}, deferred ${info.deferred || 0}, excluded ${info.excluded || 0}`);
  }
  lines.push("");
  lines.push("## Conflicts");
  lines.push(`- Duplicate _id values in exports: ${report.conflicts.duplicateIdCollections.length ? report.conflicts.duplicateIdCollections.join(", ") : "none"}`);
  lines.push(`- Duplicate user emails in export: ${report.conflicts.duplicateUserEmails.length ? report.conflicts.duplicateUserEmails.join(", ") : "none"}`);
  lines.push(`- Duplicate bookmark unique keys: ${report.conflicts.duplicateBookmarkKeys.length ? report.conflicts.duplicateBookmarkKeys.join(", ") : "none"}`);
  lines.push(`- Duplicate rating unique keys: ${report.conflicts.duplicateRatingKeys.length ? report.conflicts.duplicateRatingKeys.join(", ") : "none"}`);
  lines.push("");
  lines.push("## Exclusions And Deferred Records");
  lines.push(`- Users: ${report.collectionCounts.users.source} excluded from automatic import by policy.`);
  lines.push(`- Ratings: ${report.collectionCounts.ratings.excluded} excluded as orphaned; ${report.collectionCounts.ratings.deferred} valid-but-user-bound deferred.`);
  lines.push(`- Bookmarks: ${report.collectionCounts.bookmarks.excluded} excluded as orphaned; ${report.collectionCounts.bookmarks.deferred} valid-but-user-bound deferred.`);
  lines.push(`- Submissions: ${report.collectionCounts.submissions.excluded} excluded as orphaned; ${report.collectionCounts.submissions.deferred} valid-but-user-bound deferred.`);
  lines.push(`- Feedback: ${report.collectionCounts.feedbacks.excluded} excluded as orphaned; ${report.collectionCounts.feedbacks.deferred} valid-but-user-bound deferred.`);
  lines.push(`- Character relatedContent refs removed: ${report.characterRelatedContent.removedCount}.`);
  lines.push("");
  lines.push("## Live Database Notes");
  lines.push("No live MongoDB writes are performed by this prep. Run a separate read-only conflict check before approval/import to compare _ids and unique fields against Atlas.");
  lines.push("");
  lines.push("## Rollback Plan");
  for (const step of report.rollbackPlan) lines.push(`- ${step}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function main() {
  ensureDir(outDir);

  const exports = Object.fromEntries(COLLECTIONS.map((name) => [name, readExport(name)]));
  const refs = referenceReport(exports);

  const removedRelated = [];
  const validTargets = {
    article: collectionIdSet(exports.articles),
    media: collectionIdSet(exports.media),
    merch: collectionIdSet(exports.merches),
  };

  const transformed = {
    articles: exports.articles.map(transformArticle),
    bookmarks: {
      valid: refs.bookmarks.valid.map((entry) => transformBookmark(exports.bookmarks.find((doc) => oid(doc._id) === entry._id))),
      excluded: refs.bookmarks.excluded,
    },
    characters: exports.characters.map((doc) => transformCharacter(doc, validTargets, removedRelated)),
    contents: exports.contents.map(transformContent),
    events: exports.events,
    feedbacks: {
      valid: refs.feedbacks.valid.map((entry) => transformFeedback(exports.feedbacks.find((doc) => oid(doc._id) === entry._id))),
      excluded: refs.feedbacks.excluded,
    },
    media: exports.media,
    merches: exports.merches,
    ratings: {
      valid: refs.ratings.valid.map((entry) => exports.ratings.find((doc) => oid(doc._id) === entry._id)),
      excluded: refs.ratings.excluded,
    },
    releases: exports.releases,
    submissions: {
      valid: refs.submissions.valid.map((entry) => transformSubmission(exports.submissions.find((doc) => oid(doc._id) === entry._id))),
      excluded: refs.submissions.excluded,
    },
    users: exports.users,
  };

  const duplicates = duplicateReport(exports, transformed);

  const importReady = {
    contents: transformed.contents,
    articles: transformed.articles,
    characters: transformed.characters,
    media: transformed.media,
    merches: transformed.merches,
    events: transformed.events,
    releases: transformed.releases,
  };

  for (const [name, docs] of Object.entries(importReady)) {
    writeJson(`candidates/${name}`, docs);
  }

  writeJson("deferred-user-bound/bookmarks", transformed.bookmarks.valid);
  writeJson("deferred-user-bound/feedbacks", transformed.feedbacks.valid);
  writeJson("deferred-user-bound/ratings", transformed.ratings.valid);
  writeJson("deferred-user-bound/submissions", transformed.submissions.valid);
  writeJson("excluded/users.not-auto-imported", transformed.users);
  writeJson("excluded/bookmarks.orphaned", transformed.bookmarks.excluded);
  writeJson("excluded/feedbacks.orphaned", transformed.feedbacks.excluded);
  writeJson("excluded/ratings.orphaned", transformed.ratings.excluded);
  writeJson("excluded/submissions.orphaned", transformed.submissions.excluded);
  writeJson("excluded/characters.relatedContent.removed", removedRelated);

  const collectionCounts = {
    articles: { source: exports.articles.length, transformed: transformed.articles.length },
    bookmarks: { source: exports.bookmarks.length, transformed: 0, deferred: transformed.bookmarks.valid.length, excluded: transformed.bookmarks.excluded.length },
    characters: { source: exports.characters.length, transformed: transformed.characters.length },
    contents: { source: exports.contents.length, transformed: transformed.contents.length },
    events: { source: exports.events.length, transformed: transformed.events.length },
    feedbacks: { source: exports.feedbacks.length, transformed: 0, deferred: transformed.feedbacks.valid.length, excluded: transformed.feedbacks.excluded.length },
    media: { source: exports.media.length, transformed: transformed.media.length },
    merches: { source: exports.merches.length, transformed: transformed.merches.length },
    ratings: { source: exports.ratings.length, transformed: 0, deferred: transformed.ratings.valid.length, excluded: transformed.ratings.excluded.length },
    releases: { source: exports.releases.length, transformed: transformed.releases.length },
    submissions: { source: exports.submissions.length, transformed: 0, deferred: transformed.submissions.valid.length, excluded: transformed.submissions.excluded.length },
    users: { source: exports.users.length, transformed: 0, excluded: exports.users.length },
  };

  const proposedImportOrder = [
    { collection: "contents", count: transformed.contents.length, note: "Maria-compatible content records; category -> categorySlug and fandom." },
    { collection: "articles", count: transformed.articles.length, note: "Maria-compatible articles; fandom -> categorySlug, imageUrls[0] -> imageUrl." },
    { collection: "media", count: transformed.media.length, note: "Existing Media schema shape; import only after live duplicate check preserves existing media." },
    { collection: "merches", count: transformed.merches.length, note: "Wirsha merch records; import only after live duplicate check." },
    { collection: "characters", count: transformed.characters.length, note: "Requires articles/media/merch first for relatedContent references." },
    { collection: "events", count: transformed.events.length, note: "Previously integrated Wirsha Events schema." },
    { collection: "releases", count: transformed.releases.length, note: "Previously integrated Wirsha Releases schema." },
    { collection: "bookmarks", count: transformed.bookmarks.valid.length, note: "Deferred until live users are verified or mapped." },
    { collection: "feedbacks", count: transformed.feedbacks.valid.length, note: "Deferred until live users are verified/mapped or userId-null strategy is approved." },
    { collection: "submissions", count: transformed.submissions.valid.length, note: "Deferred until live users are verified or mapped." },
    { collection: "ratings", count: transformed.ratings.valid.length, note: "Deferred; orphaned rating excluded and valid ratings still require live users/media." },
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    sourceDir,
    outDir,
    schemaSummary: summarizeSchemas(exports),
    mappings: {
      contents: ["category -> categorySlug", "category -> fandom fallback", "description -> body fallback", "releaseDate -> releaseYear"],
      articles: ["fandom -> categorySlug", "imageUrls[0] -> imageUrl", "category preserved as article category", "fandom preserved as fandom"],
      characters: ["fandom -> categorySlug", "image -> imageUrl", "category -> title fallback", "traits -> abilities/tags fallback", "invalid relatedContent removed"],
      submissions: ["imageUrl normalized to empty string when absent", "status validated"],
      bookmarks: ["merchandise itemType normalized to merch", "unique key userId:itemType:itemId validated"],
    },
    collectionCounts,
    referenceReport: refs,
    characterRelatedContent: {
      removedCount: removedRelated.length,
      removed: removedRelated,
    },
    duplicateReport: duplicates,
    conflicts: {
      duplicateIdCollections: Object.entries(duplicates).filter(([, value]) => value.duplicateIds?.length).map(([name]) => name),
      duplicateUserEmails: duplicates.users.duplicateEmails,
      duplicateBookmarkKeys: duplicates.bookmarks.duplicateUniqueKeys,
      duplicateRatingKeys: duplicates.ratings.duplicateUniqueKeys,
      liveAtlasConflictStatus: "not checked by this offline prep script",
    },
    proposedImportOrder,
    rollbackPlan: [
      "Before any approved import, export live target collections from fanhubplus with a timestamped backup.",
      "Run the read-only live conflict check and keep its report with this prep folder.",
      "Import only into existing collections with insert-only semantics; do not drop, deleteMany, replace, or upsert existing documents.",
      "Record inserted _id values per collection during the approved import.",
      "Rollback, if explicitly approved, should delete only the inserted _id values from the import manifest in reverse import order.",
      "If any import step fails, stop immediately and do not continue to dependent collections.",
    ],
    approvalsRequiredBeforeImport: [
      "Explicit approval to import any prepared files into Atlas.",
      "Decision on whether to import, map, or skip exported users.",
      "Decision on user-bound bookmarks, feedbacks, submissions and ratings if referenced users do not already exist in live Atlas.",
      "Approval to skip the orphaned rating and the three missing character relatedContent references.",
      "Live read-only duplicate/conflict report review.",
    ],
  };

  writeJson("IMPORT_PREP_REPORT", report);
  writeText("IMPORT_PREP_REPORT.md", markdownReport(report));
  console.log(`Prepared Wirsha import artifacts at: ${outDir}`);
  console.log(JSON.stringify({
    sourceCounts: Object.fromEntries(Object.entries(collectionCounts).map(([name, info]) => [name, info.source])),
    candidateCounts: Object.fromEntries(Object.entries(collectionCounts).map(([name, info]) => [name, info.transformed])),
    deferredUserBound: Object.fromEntries(USER_BOUND_COLLECTIONS.map((name) => [name, collectionCounts[name].deferred || 0])),
    excluded: Object.fromEntries(Object.entries(collectionCounts).map(([name, info]) => [name, info.excluded || 0]).filter(([, count]) => count)),
    removedCharacterRelatedContent: removedRelated.length,
  }, null, 2));
}

main();
