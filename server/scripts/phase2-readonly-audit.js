const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { EJSON } = require("bson");
const { MongoClient, ObjectId } = require("mongodb");

process.env.MONGOOSE_AUTO_CREATE = "false";
process.env.MONGOOSE_AUTO_INDEX = "false";
process.env.MONGODB_DB_NAME = "fanhubplus";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
process.env.MONGOOSE_AUTO_CREATE = "false";
process.env.MONGOOSE_AUTO_INDEX = "false";
process.env.MONGODB_DB_NAME = "fanhubplus";

const repoRoot = path.resolve(__dirname, "..", "..");
const prepDir = path.join(repoRoot, "database-import-prep", "20260926T162742");
const phase1ManifestPath = path.join(
  repoRoot,
  "database-import-manifests",
  "phase1-wirsha-20260926T164639",
  "IMPORT_MANIFEST.json",
);
const phase1VerificationPath = path.join(
  repoRoot,
  "database-import-manifests",
  "phase1-wirsha-20260926T164639",
  "POST_IMPORT_VERIFICATION.json",
);
const runId = `phase2-readonly-audit-${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "")}`;
const outDir = path.join(repoRoot, "database-import-manifests", runId);

const knownCollections = [
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

const publicRoutes = [
  { collection: "contents", path: "/api/contents", key: "contents" },
  { collection: "articles", path: "/api/articles", key: "articles" },
  { collection: "characters", path: "/api/characters", key: "characters" },
  { collection: "media", path: "/api/media?limit=100", key: "data" },
  { collection: "merches", path: "/api/merch", key: "items" },
  { collection: "events", path: "/api/events", key: "items" },
  { collection: "releases", path: "/api/releases", key: "items" },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readEjson(filePath) {
  return EJSON.deserialize(readJson(filePath));
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value);
}

function oid(value) {
  if (!value) return "";
  if (value instanceof ObjectId) return value.toHexString();
  if (typeof value === "string") return value;
  if (value.$oid) return value.$oid;
  if (typeof value.toHexString === "function") return value.toHexString();
  return String(value);
}

function asObjectId(value) {
  const id = oid(value);
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function targetCollectionForBookmark(itemType) {
  return {
    article: "articles",
    character: "characters",
    content: "contents",
    media: "media",
    merch: "merches",
    merchandise: "merches",
    video: "contents",
  }[itemType] || null;
}

async function collectionNames(db) {
  return (await db.listCollections({}, { nameOnly: true }).toArray()).map((item) => item.name).sort();
}

async function countKnownCollections(db) {
  const counts = {};
  for (const name of knownCollections) {
    counts[name] = await db.collection(name).countDocuments({});
  }
  return counts;
}

async function readIndexes(db, names) {
  const existing = new Set(names);
  const indexes = {};
  for (const name of knownCollections) {
    if (!existing.has(name)) {
      indexes[name] = [];
      continue;
    }
    indexes[name] = (await db.collection(name).indexes()).map((index) => ({
      name: index.name,
      key: index.key,
      unique: Boolean(index.unique),
    }));
  }
  return indexes;
}

async function classifyDeferred(db) {
  const bookmarks = readEjson(path.join(prepDir, "deferred-user-bound", "bookmarks.json"));
  const feedbacks = readEjson(path.join(prepDir, "deferred-user-bound", "feedbacks.json"));
  const submissions = readEjson(path.join(prepDir, "deferred-user-bound", "submissions.json"));
  const excludedRating = readEjson(path.join(prepDir, "excluded", "ratings.orphaned.json"));
  const skippedUsers = readEjson(path.join(prepDir, "excluded", "users.not-auto-imported.json"));

  const liveUserIds = new Set((await db.collection("users").find({}, { projection: { _id: 1 } }).toArray()).map((doc) => oid(doc._id)));

  const referencedDemoUserIds = unique([
    ...bookmarks.map((doc) => oid(doc.userId)),
    ...feedbacks.map((doc) => oid(doc.userId)),
    ...submissions.map((doc) => oid(doc.userId)),
  ]);
  const demoUserIdSet = new Set(skippedUsers.map((user) => oid(user._id)));

  const bookmarkRecords = [];
  for (const doc of bookmarks) {
    const targetCollection = targetCollectionForBookmark(doc.itemType);
    const itemId = asObjectId(doc.itemId);
    const targetExists = Boolean(
      targetCollection && itemId
        ? await db.collection(targetCollection).findOne({ _id: itemId }, { projection: { _id: 1 } })
        : null,
    );
    const userId = oid(doc.userId);
    bookmarkRecords.push({
      _id: oid(doc._id),
      itemType: doc.itemType,
      itemId: oid(doc.itemId),
      targetCollection,
      targetExists,
      userId,
      liveUserExists: liveUserIds.has(userId),
      referencedExportUserExists: demoUserIdSet.has(userId),
      proposal: "requires-user-mapping",
      reason: "Bookmark.userId is required and the referenced export user is not present in live fanhubplus.",
    });
  }

  const feedbackRecords = feedbacks.map((doc) => {
    const userId = oid(doc.userId);
    const hasOwner = Boolean(userId);
    return {
      _id: oid(doc._id),
      type: doc.type,
      subject: doc.subject,
      userId: userId || null,
      liveUserExists: userId ? liveUserIds.has(userId) : false,
      referencedExportUserExists: userId ? demoUserIdSet.has(userId) : false,
      proposal: hasOwner ? "requires-user-mapping" : "importable-as-guest-if-approved",
      reason: hasOwner
        ? "Feedback has an export userId that is not present in live fanhubplus."
        : "Feedback.userId is already null and the schema supports guest feedback.",
    };
  });

  const submissionRecords = submissions.map((doc) => {
    const userId = oid(doc.userId);
    return {
      _id: oid(doc._id),
      title: doc.title,
      category: doc.category,
      fandom: doc.fandom,
      userId,
      liveUserExists: liveUserIds.has(userId),
      referencedExportUserExists: demoUserIdSet.has(userId),
      proposal: "requires-user-mapping",
      reason: "Submission.userId is required and ownership should not be invented or nulled.",
    };
  });

  return {
    historicalMigrationAuthorized: false,
    summary: {
      deferredHistoricalRecords: bookmarks.length + feedbacks.length + submissions.length,
      bookmarks: bookmarks.length,
      feedbacks: feedbacks.length,
      submissions: submissions.length,
      skippedDemoUsers: skippedUsers.length,
      excludedOrphanedRatings: excludedRating.length,
      referencedDemoUserIds,
    },
    skippedDemoUsers: skippedUsers.map((user) => ({
      _id: oid(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    })),
    records: {
      bookmarks: bookmarkRecords,
      feedbacks: feedbackRecords,
      submissions: submissionRecords,
      orphanedRatings: excludedRating.map((rating) => ({
        _id: oid(rating._id),
        userId: oid(rating.userId),
        mediaId: oid(rating.mediaId),
        proposal: "remain-archived",
        reason: "Original prep classified this rating as orphaned; missing exported userId and referenced mediaId.",
      })),
    },
    proposedDecision: {
      importNow: [],
      canImportAfterExplicitGuestApproval: feedbackRecords
        .filter((record) => record.proposal === "importable-as-guest-if-approved")
        .map((record) => record._id),
      requiresExplicitUserMapping: [
        ...bookmarkRecords.map((record) => record._id),
        ...feedbackRecords.filter((record) => record.proposal === "requires-user-mapping").map((record) => record._id),
        ...submissionRecords.map((record) => record._id),
      ],
      remainArchived: excludedRating.map((rating) => oid(rating._id)),
    },
  };
}

async function runPublicApiChecks() {
  const connectDB = require("../config/db");
  const app = require("../server");
  const results = {};
  let server;

  try {
    await connectDB();
    server = await new Promise((resolve) => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    for (const route of publicRoutes) {
      const response = await fetch(`${baseUrl}${route.path}`);
      let body = null;
      try {
        body = await response.json();
      } catch (error) {
        body = { parseError: error.message };
      }
      const items = body?.[route.key];
      results[route.collection] = {
        path: route.path,
        status: response.status,
        ok: response.ok,
        expectedArrayKey: route.key,
        arrayPresent: Array.isArray(items),
        returnedCount: Array.isArray(items) ? items.length : null,
        consumable: response.ok && Array.isArray(items),
      };
    }
  } finally {
    if (server) {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }

  return results;
}

function markdown(report) {
  const lines = [];
  lines.push("# Phase 2 Read-Only Audit");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Database: ${report.database}`);
  lines.push("");
  lines.push("## Live Counts");
  for (const [name, count] of Object.entries(report.live.counts)) {
    lines.push(`- ${name}: ${count}`);
  }
  lines.push("");
  lines.push("## Deferred Historical Records");
  lines.push(`- Total deferred bookmark/feedback/submission records: ${report.deferred.summary.deferredHistoricalRecords}`);
  lines.push(`- Bookmarks requiring user mapping: ${report.deferred.records.bookmarks.length}`);
  lines.push(`- Feedback requiring user mapping: ${report.deferred.records.feedbacks.filter((r) => r.proposal === "requires-user-mapping").length}`);
  lines.push(`- Feedback importable as guest only after explicit approval: ${report.deferred.proposedDecision.canImportAfterExplicitGuestApproval.length}`);
  lines.push(`- Submissions requiring user mapping: ${report.deferred.records.submissions.length}`);
  lines.push(`- Orphaned ratings to remain archived: ${report.deferred.records.orphanedRatings.length}`);
  lines.push("");
  lines.push("## Route Checks");
  for (const [name, check] of Object.entries(report.publicApiChecks)) {
    lines.push(`- ${name}: ${check.status}, ${check.consumable ? "consumable" : "not consumable"}, count ${check.returnedCount}`);
  }
  lines.push("");
  lines.push("No historical records were imported by this audit.");
  lines.push("");
  return `${lines.join("\n")}`;
}

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGODB_URI/MONGO_URI in server .env.");

  ensureDir(outDir);

  const client = new MongoClient(uri, {
    appName: "fan-hub-plus-phase2-readonly-audit",
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    const db = client.db("fanhubplus");
    const names = await collectionNames(db);
    const counts = await countKnownCollections(db);
    const indexes = await readIndexes(db, names);
    const deferred = await classifyDeferred(db);

    const report = {
      generatedAt: new Date().toISOString(),
      database: "fanhubplus",
      writesPerformed: false,
      phase1ManifestPath,
      phase1VerificationPath,
      live: {
        collectionNames: names,
        counts,
        indexes,
      },
      phase1StillMatchesExpected: {
        contents: counts.contents === 17,
        articles: counts.articles === 14,
        media: counts.media === 20,
        merches: counts.merches === 20,
        characters: counts.characters === 21,
        events: counts.events === 10,
        releases: counts.releases === 17,
      },
      deferred,
      publicApiChecks: await runPublicApiChecks(),
    };

    writeJson(path.join(outDir, "PHASE2_READONLY_AUDIT.json"), report);
    writeText(path.join(outDir, "PHASE2_DEFERRED_MIGRATION_PROPOSAL.md"), markdown(report));

    console.log(JSON.stringify({
      reportDir: outDir,
      counts,
      phase1StillMatchesExpected: report.phase1StillMatchesExpected,
      deferred: report.deferred.summary,
      routeIssues: Object.entries(report.publicApiChecks)
        .filter(([, check]) => !check.consumable)
        .map(([name]) => name),
    }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(`Phase 2 read-only audit failed: ${error.message}`);
  process.exit(1);
});
