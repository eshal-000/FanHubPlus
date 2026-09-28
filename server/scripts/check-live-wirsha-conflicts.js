const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i], process.argv[i + 1]);
}

const prepDir = path.resolve(args.get("--prep") || "");
const outPath = args.get("--out") ? path.resolve(args.get("--out")) : path.join(prepDir, "LIVE_CONFLICT_REPORT.json");

if (!prepDir || !fs.existsSync(prepDir)) {
  console.error("Usage: node server/scripts/check-live-wirsha-conflicts.js --prep <database-import-prep-folder>");
  process.exit(1);
}

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.error("Missing MONGODB_URI/MONGO_URI in server .env.");
  process.exit(1);
}

function read(relativePath) {
  const fullPath = path.join(prepDir, relativePath);
  return fs.existsSync(fullPath) ? JSON.parse(fs.readFileSync(fullPath, "utf8")) : [];
}

function oid(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.$oid || "";
}

function asObjectId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

async function existingIds(db, collection, docs) {
  const ids = unique(docs.map((doc) => oid(doc._id))).map(asObjectId).filter(Boolean);
  if (!ids.length) return [];
  const found = await db.collection(collection).find({ _id: { $in: ids } }, { projection: { _id: 1 } }).toArray();
  return found.map((doc) => String(doc._id));
}

async function existingValues(db, collection, field, values) {
  const clean = unique(values.map((value) => String(value || "").trim()).filter(Boolean));
  if (!clean.length) return [];
  const found = await db.collection(collection).find({ [field]: { $in: clean } }, { projection: { _id: 1, [field]: 1 } }).toArray();
  return found.map((doc) => ({ _id: String(doc._id), [field]: doc[field] }));
}

async function existingCompositeBookmarks(db, bookmarks) {
  const hits = [];
  for (const bookmark of bookmarks) {
    const userId = asObjectId(oid(bookmark.userId));
    const itemId = asObjectId(oid(bookmark.itemId));
    if (!userId || !itemId) continue;
    const existing = await db.collection("bookmarks").findOne(
      { userId, itemType: bookmark.itemType, itemId },
      { projection: { _id: 1 } },
    );
    if (existing) {
      hits.push({ _id: String(existing._id), userId: String(userId), itemType: bookmark.itemType, itemId: String(itemId) });
    }
  }
  return hits;
}

async function existingCompositeRatings(db, ratings) {
  const hits = [];
  for (const rating of ratings) {
    const userId = asObjectId(oid(rating.userId));
    const mediaId = asObjectId(oid(rating.mediaId));
    if (!userId || !mediaId) continue;
    const existing = await db.collection("ratings").findOne(
      { userId, mediaId },
      { projection: { _id: 1 } },
    );
    if (existing) {
      hits.push({ _id: String(existing._id), userId: String(userId), mediaId: String(mediaId) });
    }
  }
  return hits;
}

async function missingLiveUsers(db, docs) {
  const ids = unique(docs.map((doc) => oid(doc.userId))).map(asObjectId).filter(Boolean);
  if (!ids.length) return [];
  const found = await db.collection("users").find({ _id: { $in: ids } }, { projection: { _id: 1 } }).toArray();
  const foundSet = new Set(found.map((doc) => String(doc._id)));
  return ids.map(String).filter((id) => !foundSet.has(id));
}

async function main() {
  const candidates = {
    articles: read("candidates/articles.json"),
    characters: read("candidates/characters.json"),
    contents: read("candidates/contents.json"),
    events: read("candidates/events.json"),
    media: read("candidates/media.json"),
    merches: read("candidates/merches.json"),
    releases: read("candidates/releases.json"),
  };
  const deferred = {
    bookmarks: read("deferred-user-bound/bookmarks.json"),
    feedbacks: read("deferred-user-bound/feedbacks.json"),
    ratings: read("deferred-user-bound/ratings.json"),
    submissions: read("deferred-user-bound/submissions.json"),
  };
  const skippedUsers = read("excluded/users.not-auto-imported.json");

  const client = new MongoClient(uri, {
    appName: "fan-hub-plus-readonly-import-conflict-check",
    serverSelectionTimeoutMS: 8000,
  });

  await client.connect();
  const db = client.db("fanhubplus");

  const report = {
    checkedAt: new Date().toISOString(),
    database: "fanhubplus",
    writesPerformed: false,
    existingCollectionCounts: {},
    candidateIdConflicts: {},
    uniqueFieldConflicts: {},
    missingLiveUserRefs: {},
    deferredCompositeConflicts: {},
  };

  for (const name of [
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
  ]) {
    report.existingCollectionCounts[name] = await db.collection(name).countDocuments({});
  }

  for (const [name, docs] of Object.entries(candidates)) {
    report.candidateIdConflicts[name] = await existingIds(db, name, docs);
  }

  report.uniqueFieldConflicts.usersByEmail = await existingValues(db, "users", "email", skippedUsers.map((user) => user.email));
  report.uniqueFieldConflicts.articleSlugs = await existingValues(db, "articles", "slug", candidates.articles.map((doc) => doc.slug));
  report.uniqueFieldConflicts.contentSlugs = await existingValues(db, "contents", "slug", candidates.contents.map((doc) => doc.slug));
  report.uniqueFieldConflicts.mediaTitles = await existingValues(db, "media", "title", candidates.media.map((doc) => doc.title));
  report.uniqueFieldConflicts.merchNames = await existingValues(db, "merches", "name", candidates.merches.map((doc) => doc.name));

  report.missingLiveUserRefs.bookmarks = await missingLiveUsers(db, deferred.bookmarks);
  report.missingLiveUserRefs.feedbacks = await missingLiveUsers(db, deferred.feedbacks);
  report.missingLiveUserRefs.ratings = await missingLiveUsers(db, deferred.ratings);
  report.missingLiveUserRefs.submissions = await missingLiveUsers(db, deferred.submissions);

  report.deferredCompositeConflicts.bookmarks = await existingCompositeBookmarks(db, deferred.bookmarks);
  report.deferredCompositeConflicts.ratings = await existingCompositeRatings(db, deferred.ratings);

  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  await client.close();

  console.log(`Read-only live conflict report written to: ${outPath}`);
  console.log(JSON.stringify({
    existingCollectionCounts: report.existingCollectionCounts,
    idConflictCollections: Object.entries(report.candidateIdConflicts).filter(([, ids]) => ids.length).map(([name]) => name),
    missingLiveUserRefs: Object.fromEntries(Object.entries(report.missingLiveUserRefs).map(([name, ids]) => [name, ids.length])),
  }, null, 2));
}

main().catch((error) => {
  console.error(`Read-only live conflict check failed: ${error.message}`);
  process.exit(1);
});
