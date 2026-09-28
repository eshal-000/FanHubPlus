const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { EJSON } = require("bson");
const { MongoClient, ObjectId } = require("mongodb");

process.env.MONGOOSE_AUTO_CREATE = "false";
process.env.MONGOOSE_AUTO_INDEX = "false";
process.env.MONGODB_DB_NAME = "fanhubplus";
mongoose.set("autoCreate", false);
mongoose.set("autoIndex", false);

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
process.env.MONGOOSE_AUTO_CREATE = "false";
process.env.MONGOOSE_AUTO_INDEX = "false";
process.env.MONGODB_DB_NAME = "fanhubplus";

const Content = require("../models/Content");
const Article = require("../models/Article");
const Media = require("../models/Media");
const Merch = require("../models/Merch");
const Character = require("../models/Character");
const Event = require("../models/Event");
const Release = require("../models/Release");

const repoRoot = path.resolve(__dirname, "..", "..");
const defaultPrepDir = path.join(repoRoot, "database-import-prep", "20260926T162742");
const databaseName = "fanhubplus";

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

const phase1 = [
  { collection: "contents", expected: 17, model: Content, apiPath: "/api/contents", apiArrayKey: "contents", uniqueField: "slug" },
  { collection: "articles", expected: 14, model: Article, apiPath: "/api/articles", apiArrayKey: "articles", uniqueField: "slug" },
  { collection: "media", expected: 19, model: Media, apiPath: "/api/media", apiArrayKey: "data", uniqueField: "title" },
  { collection: "merches", expected: 20, model: Merch, apiPath: "/api/merch", apiArrayKey: "items", uniqueField: "name" },
  { collection: "characters", expected: 21, model: Character, apiPath: "/api/characters", apiArrayKey: "characters" },
  { collection: "events", expected: 10, model: Event, apiPath: "/api/events", apiArrayKey: "items" },
  { collection: "releases", expected: 17, model: Release, apiPath: "/api/releases", apiArrayKey: "items" },
];

const collectionByRelatedKind = {
  article: "articles",
  media: "media",
  merch: "merches",
};

function parseArgs() {
  const args = new Map();
  for (let i = 2; i < process.argv.length; i += 1) {
    const key = process.argv[i];
    if (!key.startsWith("--")) continue;
    const next = process.argv[i + 1];
    if (!next || next.startsWith("--")) {
      args.set(key, true);
    } else {
      args.set(key, next);
      i += 1;
    }
  }
  return args;
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
}

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

function writeEjson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(EJSON.serialize(value, { relaxed: false }), null, 2)}\n`);
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

function sortForStableJson(value) {
  if (Array.isArray(value)) return value.map(sortForStableJson);
  if (value && typeof value === "object" && !(value instanceof Date) && !(value instanceof ObjectId)) {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortForStableJson(value[key]);
        return acc;
      }, {});
  }
  return value;
}

function canonicalEjson(value) {
  return JSON.stringify(sortForStableJson(EJSON.serialize(value, { relaxed: false })));
}

function loadCandidates(prepDir) {
  const candidates = {};
  for (const item of phase1) {
    candidates[item.collection] = readEjson(path.join(prepDir, "candidates", `${item.collection}.json`));
  }
  return candidates;
}

function loadDeferred(prepDir) {
  return {
    bookmarks: readEjson(path.join(prepDir, "deferred-user-bound", "bookmarks.json")),
    feedbacks: readEjson(path.join(prepDir, "deferred-user-bound", "feedbacks.json")),
    ratings: readEjson(path.join(prepDir, "deferred-user-bound", "ratings.json")),
    submissions: readEjson(path.join(prepDir, "deferred-user-bound", "submissions.json")),
    skippedUsers: readEjson(path.join(prepDir, "excluded", "users.not-auto-imported.json")),
  };
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

async function existingIds(db, collection, docs) {
  const ids = unique(docs.map((doc) => oid(doc._id))).map(asObjectId).filter(Boolean);
  if (!ids.length) return [];
  const found = await db.collection(collection).find({ _id: { $in: ids } }, { projection: { _id: 1 } }).toArray();
  return found.map((doc) => oid(doc._id)).sort();
}

async function existingValues(db, collection, field, values) {
  const clean = unique(values.map((value) => String(value || "").trim()).filter(Boolean));
  if (!clean.length) return [];
  const found = await db.collection(collection).find({ [field]: { $in: clean } }, { projection: { _id: 1, [field]: 1 } }).toArray();
  return found.map((doc) => ({ _id: oid(doc._id), [field]: doc[field] }));
}

async function missingLiveUsers(db, docs) {
  const ids = unique(docs.map((doc) => oid(doc.userId))).map(asObjectId).filter(Boolean);
  if (!ids.length) return [];
  const found = await db.collection("users").find({ _id: { $in: ids } }, { projection: { _id: 1 } }).toArray();
  const foundSet = new Set(found.map((doc) => oid(doc._id)));
  return ids.map(oid).filter((id) => !foundSet.has(id)).sort();
}

async function liveCheck(db, candidates, deferred) {
  const existingCollectionNames = await collectionNames(db);
  const existingCollectionCounts = await countKnownCollections(db);
  const candidateIdConflicts = {};
  const uniqueFieldConflicts = {};

  for (const item of phase1) {
    candidateIdConflicts[item.collection] = await existingIds(db, item.collection, candidates[item.collection]);
  }

  uniqueFieldConflicts.usersByEmail = await existingValues(
    db,
    "users",
    "email",
    deferred.skippedUsers.map((user) => user.email),
  );
  uniqueFieldConflicts.articleSlugs = await existingValues(db, "articles", "slug", candidates.articles.map((doc) => doc.slug));
  uniqueFieldConflicts.contentSlugs = await existingValues(db, "contents", "slug", candidates.contents.map((doc) => doc.slug));
  uniqueFieldConflicts.mediaTitles = await existingValues(db, "media", "title", candidates.media.map((doc) => doc.title));
  uniqueFieldConflicts.merchNames = await existingValues(db, "merches", "name", candidates.merches.map((doc) => doc.name));

  return {
    checkedAt: new Date().toISOString(),
    database: databaseName,
    writesPerformed: false,
    existingCollectionNames,
    existingCollectionCounts,
    candidateIdConflicts,
    uniqueFieldConflicts,
    missingLiveUserRefs: {
      bookmarks: await missingLiveUsers(db, deferred.bookmarks),
      feedbacks: await missingLiveUsers(db, deferred.feedbacks),
      ratings: await missingLiveUsers(db, deferred.ratings),
      submissions: await missingLiveUsers(db, deferred.submissions),
    },
  };
}

function compareToPreviousLiveCheck(fresh, previousReportPath) {
  const previous = readJson(previousReportPath);
  const issues = [];

  for (const name of knownCollections) {
    const before = previous.existingCollectionCounts?.[name] ?? 0;
    const now = fresh.existingCollectionCounts[name] ?? 0;
    if (before !== now) {
      issues.push(`live count changed for ${name}: previous ${before}, fresh ${now}`);
    }
  }

  for (const [name, ids] of Object.entries(fresh.candidateIdConflicts)) {
    if (ids.length) issues.push(`fresh candidate _id conflicts in ${name}: ${ids.join(", ")}`);
  }

  for (const [name, conflicts] of Object.entries(fresh.uniqueFieldConflicts)) {
    if (conflicts.length) issues.push(`fresh unique-field conflicts in ${name}: ${JSON.stringify(conflicts)}`);
  }

  return {
    previousReportPath,
    significantChange: issues.length > 0,
    issues,
  };
}

async function createAndVerifyBackup(db, backupRoot, liveSnapshot) {
  const backupDir = path.join(backupRoot, `fanhubplus-live-${timestamp()}`);
  const collectionsDir = path.join(backupDir, "collections");
  ensureDir(collectionsDir);

  const initialCollections = await collectionNames(db);
  const collectionSet = new Set([...initialCollections, ...knownCollections]);
  const collections = {};

  for (const name of [...collectionSet].sort()) {
    const docs = await db.collection(name).find({}).sort({ _id: 1 }).toArray();
    const fileName = `${name}.json`;
    writeEjson(path.join(collectionsDir, fileName), docs);
    collections[name] = {
      actualCollectionExisted: initialCollections.includes(name),
      count: docs.length,
      file: path.join("collections", fileName),
      ids: docs.map((doc) => oid(doc._id)),
    };
  }

  const backupManifest = {
    generatedAt: new Date().toISOString(),
    database: databaseName,
    backupDir,
    source: "live Atlas database via project MONGODB_URI",
    existingCollectionNames: initialCollections,
    knownCollections,
    liveSnapshotBeforeBackup: liveSnapshot,
    collections,
  };
  writeJson(path.join(backupDir, "BACKUP_MANIFEST.json"), backupManifest);

  const verification = {
    checkedAt: new Date().toISOString(),
    backupDir,
    readable: true,
    complete: true,
    issues: [],
    checkedCollections: {},
  };

  for (const [name, info] of Object.entries(collections)) {
    const parsed = readEjson(path.join(backupDir, info.file));
    const parsedIds = parsed.map((doc) => oid(doc._id)).sort();
    const expectedIds = [...info.ids].sort();
    const countMatches = parsed.length === info.count;
    const idsMatch = JSON.stringify(parsedIds) === JSON.stringify(expectedIds);
    verification.checkedCollections[name] = {
      count: parsed.length,
      countMatches,
      idsMatch,
    };
    if (!countMatches || !idsMatch) {
      verification.complete = false;
      verification.issues.push(`backup verification failed for ${name}`);
    }
  }

  const collectionsAfterBackup = await collectionNames(db);
  if (JSON.stringify(initialCollections) !== JSON.stringify(collectionsAfterBackup)) {
    verification.complete = false;
    verification.issues.push("live collection list changed while backup was being created");
  }

  const countsAfterBackup = await countKnownCollections(db);
  for (const [name, count] of Object.entries(liveSnapshot.existingCollectionCounts)) {
    if (countsAfterBackup[name] !== count) {
      verification.complete = false;
      verification.issues.push(`live count changed during backup for ${name}: before ${count}, after ${countsAfterBackup[name]}`);
    }
  }

  writeJson(path.join(backupDir, "BACKUP_VERIFICATION.json"), verification);
  if (!verification.complete) {
    throw new Error(`Backup verification failed: ${verification.issues.join("; ")}`);
  }

  return { backupDir, manifest: backupManifest, verification };
}

async function validateCandidates(candidates, liveSnapshot) {
  const validation = {
    checkedAt: new Date().toISOString(),
    expectedCounts: {},
    actualCounts: {},
    modelValidation: {},
    candidateDuplicateIds: {},
    candidateDuplicateUniqueFields: {},
    schemaUniqueIndexes: {},
    mappingChecks: {},
    relationshipChecks: {
      characterRelatedContent: { valid: true, checked: 0, invalid: [] },
    },
    issues: [],
  };

  for (const item of phase1) {
    const docs = candidates[item.collection];
    validation.expectedCounts[item.collection] = item.expected;
    validation.actualCounts[item.collection] = docs.length;
    validation.modelValidation[item.collection] = { valid: 0, invalid: [] };
    validation.candidateDuplicateIds[item.collection] = duplicateValues(docs.map((doc) => oid(doc._id)));
    validation.schemaUniqueIndexes[item.collection] = item.model.schema
      .indexes()
      .filter(([, options]) => options?.unique)
      .map(([fields]) => fields);

    if (docs.length !== item.expected) {
      validation.issues.push(`${item.collection} expected ${item.expected} candidates but found ${docs.length}`);
    }
    if (validation.candidateDuplicateIds[item.collection].length) {
      validation.issues.push(`${item.collection} has duplicate _id values`);
    }

    if (item.uniqueField) {
      validation.candidateDuplicateUniqueFields[item.collection] = duplicateValues(
        docs.map((doc) => String(doc[item.uniqueField] || "").trim()).filter(Boolean),
      );
    }

    for (const doc of docs) {
      try {
        await new item.model(doc).validate();
        validation.modelValidation[item.collection].valid += 1;
      } catch (error) {
        validation.modelValidation[item.collection].invalid.push({
          _id: oid(doc._id),
          message: error.message,
        });
        validation.issues.push(`${item.collection} ${oid(doc._id)} failed Mongoose validation: ${error.message}`);
      }
    }
  }

  validation.mappingChecks.contents = candidates.contents.map((doc) => ({
    _id: oid(doc._id),
    hasCategorySlug: Boolean(doc.categorySlug),
    hasFandom: Boolean(doc.fandom),
    hasImageUrlField: Object.prototype.hasOwnProperty.call(doc, "imageUrl"),
  }));
  validation.mappingChecks.articles = candidates.articles.map((doc) => ({
    _id: oid(doc._id),
    hasCategorySlug: Boolean(doc.categorySlug),
    imageUrlMatchesFirstImageUrls: !doc.imageUrls?.length || doc.imageUrl === doc.imageUrls[0],
  }));
  validation.mappingChecks.characters = candidates.characters.map((doc) => ({
    _id: oid(doc._id),
    hasCategorySlug: Boolean(doc.categorySlug),
    hasImageUrl: Boolean(doc.imageUrl || doc.image),
    relatedContentCount: doc.relatedContent?.length || 0,
  }));

  const targetIds = {
    article: new Set(candidates.articles.map((doc) => oid(doc._id))),
    media: new Set(candidates.media.map((doc) => oid(doc._id))),
    merch: new Set(candidates.merches.map((doc) => oid(doc._id))),
  };

  for (const character of candidates.characters) {
    for (const item of character.relatedContent || []) {
      validation.relationshipChecks.characterRelatedContent.checked += 1;
      const kind = item.kind;
      const itemId = oid(item.item);
      if (!targetIds[kind]?.has(itemId)) {
        validation.relationshipChecks.characterRelatedContent.valid = false;
        validation.relationshipChecks.characterRelatedContent.invalid.push({
          characterId: oid(character._id),
          kind,
          itemId,
        });
        validation.issues.push(`character ${oid(character._id)} has unresolved relatedContent ${kind}:${itemId}`);
      }
    }
  }

  const liveUniqueConflicts = Object.values(liveSnapshot.uniqueFieldConflicts).flat();
  if (liveUniqueConflicts.length) {
    validation.issues.push("fresh live unique-field conflicts exist; import should not continue");
  }

  return validation;
}

function assertValidationPassed(validation) {
  if (validation.issues.length) {
    throw new Error(`Final validation failed: ${validation.issues.join("; ")}`);
  }
}

async function uniqueConflictIds(db, item, docs) {
  if (!item.uniqueField) return new Map();
  const values = unique(docs.map((doc) => String(doc[item.uniqueField] || "").trim()).filter(Boolean));
  if (!values.length) return new Map();
  const existing = await db
    .collection(item.collection)
    .find({ [item.uniqueField]: { $in: values } }, { projection: { _id: 1, [item.uniqueField]: 1 } })
    .toArray();
  const conflictValues = new Map(existing.map((doc) => [String(doc[item.uniqueField]), oid(doc._id)]));
  const conflicts = new Map();
  for (const doc of docs) {
    const value = String(doc[item.uniqueField] || "").trim();
    if (value && conflictValues.has(value)) {
      conflicts.set(oid(doc._id), `${item.uniqueField} already exists on ${conflictValues.get(value)}`);
    }
  }
  return conflicts;
}

async function importPhase1(db, candidates, manifest, saveManifest) {
  for (const item of phase1) {
    const docs = candidates[item.collection];
    const idConflicts = new Set(await existingIds(db, item.collection, docs));
    const uniqueConflicts = await uniqueConflictIds(db, item, docs);
    const skipped = [];
    const docsToInsert = [];

    for (const doc of docs) {
      const id = oid(doc._id);
      if (idConflicts.has(id)) {
        skipped.push({ _id: id, reason: "existing _id conflict; preserved live document" });
      } else if (uniqueConflicts.has(id)) {
        skipped.push({ _id: id, reason: uniqueConflicts.get(id) });
      } else {
        docsToInsert.push(doc);
      }
    }

    const result = {
      collection: item.collection,
      candidateCount: docs.length,
      insertedCount: 0,
      insertedIds: [],
      skipped,
      error: null,
    };

    if (docsToInsert.length) {
      const insertResult = await db.collection(item.collection).insertMany(docsToInsert, { ordered: true });
      result.insertedCount = insertResult.insertedCount;
      result.insertedIds = Object.values(insertResult.insertedIds).map(oid);
    }

    manifest.importResults[item.collection] = result;
    saveManifest();
  }
}

async function verifyPreExistingDocuments(db, backupManifest, backupDir) {
  const results = {};
  for (const [name, info] of Object.entries(backupManifest.collections)) {
    if (!info.ids.length) {
      results[name] = { checked: 0, missingIds: [], changedIds: [] };
      continue;
    }

    const backupDocs = readEjson(path.join(backupDir, info.file));
    const backupById = new Map(backupDocs.map((doc) => [oid(doc._id), canonicalEjson(doc)]));
    const liveDocs = await db
      .collection(name)
      .find({ _id: { $in: info.ids.map(asObjectId).filter(Boolean) } })
      .toArray();
    const liveById = new Map(liveDocs.map((doc) => [oid(doc._id), canonicalEjson(doc)]));
    const missingIds = [];
    const changedIds = [];

    for (const [id, expected] of backupById.entries()) {
      if (!liveById.has(id)) missingIds.push(id);
      else if (liveById.get(id) !== expected) changedIds.push(id);
    }

    results[name] = { checked: backupDocs.length, missingIds, changedIds };
  }
  return results;
}

async function verifyInsertedDocuments(db, manifest) {
  const results = {};
  for (const item of phase1) {
    const insertedIds = manifest.importResults[item.collection]?.insertedIds || [];
    if (!insertedIds.length) {
      results[item.collection] = { expectedInserted: 0, foundInserted: 0, missingIds: [], modelValidation: { valid: 0, invalid: [] } };
      continue;
    }

    const ids = insertedIds.map(asObjectId).filter(Boolean);
    const found = await db.collection(item.collection).find({ _id: { $in: ids } }).toArray();
    const foundIds = new Set(found.map((doc) => oid(doc._id)));
    const missingIds = insertedIds.filter((id) => !foundIds.has(id));
    const modelValidation = { valid: 0, invalid: [] };

    for (const doc of found) {
      try {
        await new item.model(doc).validate();
        modelValidation.valid += 1;
      } catch (error) {
        modelValidation.invalid.push({ _id: oid(doc._id), message: error.message });
      }
    }

    results[item.collection] = {
      expectedInserted: insertedIds.length,
      foundInserted: found.length,
      missingIds,
      modelValidation,
    };
  }
  return results;
}

async function verifyCharacterRelationships(db, insertedCharacterIds) {
  const result = { checked: 0, valid: true, invalid: [] };
  if (!insertedCharacterIds.length) return result;

  const characters = await db
    .collection("characters")
    .find({ _id: { $in: insertedCharacterIds.map(asObjectId).filter(Boolean) } })
    .toArray();

  for (const character of characters) {
    for (const item of character.relatedContent || []) {
      result.checked += 1;
      const collection = collectionByRelatedKind[item.kind];
      const itemId = asObjectId(item.item);
      if (!collection || !itemId) {
        result.valid = false;
        result.invalid.push({ characterId: oid(character._id), kind: item.kind, itemId: oid(item.item), reason: "invalid kind or ObjectId" });
        continue;
      }
      const exists = await db.collection(collection).findOne({ _id: itemId }, { projection: { _id: 1 } });
      if (!exists) {
        result.valid = false;
        result.invalid.push({ characterId: oid(character._id), kind: item.kind, itemId: oid(item.item), reason: "target missing" });
      }
    }
  }

  return result;
}

async function runApiChecks() {
  const connectDB = require("../config/db");
  const app = require("../server");
  const results = {};
  let server;

  try {
    await connectDB();
    server = await new Promise((resolve) => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    for (const item of phase1) {
      const url = `${baseUrl}${item.apiPath}`;
      const response = await fetch(url);
      let body = null;
      try {
        body = await response.json();
      } catch (error) {
        body = { parseError: error.message };
      }

      const arrayValue = body?.[item.apiArrayKey];
      results[item.collection] = {
        method: "GET",
        path: item.apiPath,
        status: response.status,
        ok: response.ok,
        expectedArrayKey: item.apiArrayKey,
        arrayPresent: Array.isArray(arrayValue),
        returnedCount: Array.isArray(arrayValue) ? arrayValue.length : null,
        consumable: response.ok && Array.isArray(arrayValue),
      };
    }
  } finally {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }

  return results;
}

function rollbackPlan(manifestPath) {
  return [
    "Do not run rollback unless explicitly approved by the project owner.",
    `Use the insertedIds recorded in ${manifestPath}.`,
    "Delete only those inserted _id values, in reverse import order: releases, events, characters, merches, media, articles, contents.",
    "Use deleteMany({ _id: { $in: [...] } }) only for IDs present in the manifest; never drop collections and never delete records not listed in the manifest.",
    "After any approved rollback, compare live counts and pre-existing document IDs against BACKUP_MANIFEST.json and BACKUP_VERIFICATION.json.",
    "The full backup is available for manual document-level restore if a targeted rollback is not sufficient, but no destructive restore was executed by this script.",
  ];
}

function writeRollbackPlan(filePath, plan) {
  const lines = ["# Phase 1 Rollback Plan", "", ...plan.map((step, index) => `${index + 1}. ${step}`), ""];
  fs.writeFileSync(filePath, lines.join("\n"));
}

async function main() {
  const args = parseArgs();
  const prepDir = path.resolve(args.get("--prep") || defaultPrepDir);
  const previousReportPath = path.join(prepDir, "LIVE_CONFLICT_REPORT.json");
  const runId = `phase1-wirsha-${timestamp()}`;
  const manifestDir = path.join(repoRoot, "database-import-manifests", runId);
  const manifestPath = path.join(manifestDir, "IMPORT_MANIFEST.json");
  const verificationPath = path.join(manifestDir, "POST_IMPORT_VERIFICATION.json");
  const backupRoot = path.join(repoRoot, "database-backups");

  ensureDir(manifestDir);

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI/MONGO_URI in server .env.");
  }
  if (!fs.existsSync(prepDir)) {
    throw new Error(`Prep directory not found: ${prepDir}`);
  }
  if (!fs.existsSync(previousReportPath)) {
    throw new Error(`Previous live conflict report not found: ${previousReportPath}`);
  }

  const candidates = loadCandidates(prepDir);
  const deferred = loadDeferred(prepDir);
  const client = new MongoClient(uri, {
    appName: "fan-hub-plus-phase1-wirsha-import",
    serverSelectionTimeoutMS: 10000,
  });

  const manifest = {
    runId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    database: databaseName,
    prepDir,
    sourceExportDir: path.join(repoRoot, "wirshas-db", "fanhubplus-backup"),
    writesAllowed: "insert-only for approved Phase 1 collections",
    approvedImportOrder: phase1.map((item) => ({ collection: item.collection, expected: item.expected })),
    freshLiveCheck: null,
    freshLiveComparison: null,
    backup: null,
    finalValidation: null,
    importResults: {},
    postImportVerificationPath: verificationPath,
    status: "started",
    errors: [],
    rollbackPlan: rollbackPlan(manifestPath),
  };

  const saveManifest = () => writeJson(manifestPath, manifest);
  saveManifest();

  try {
    await client.connect();
    const db = client.db(databaseName);

    manifest.freshLiveCheck = await liveCheck(db, candidates, deferred);
    manifest.freshLiveComparison = compareToPreviousLiveCheck(manifest.freshLiveCheck, previousReportPath);
    manifest.status = "fresh-live-check-complete";
    saveManifest();

    if (manifest.freshLiveComparison.significantChange) {
      throw new Error(`Fresh live state changed from approved report: ${manifest.freshLiveComparison.issues.join("; ")}`);
    }

    const backup = await createAndVerifyBackup(db, backupRoot, manifest.freshLiveCheck);
    manifest.backup = {
      backupDir: backup.backupDir,
      manifestPath: path.join(backup.backupDir, "BACKUP_MANIFEST.json"),
      verificationPath: path.join(backup.backupDir, "BACKUP_VERIFICATION.json"),
      verified: backup.verification.complete,
    };
    manifest.status = "backup-complete";
    saveManifest();

    manifest.finalValidation = await validateCandidates(candidates, manifest.freshLiveCheck);
    manifest.status = "final-validation-complete";
    saveManifest();
    assertValidationPassed(manifest.finalValidation);

    await importPhase1(db, candidates, manifest, saveManifest);
    manifest.status = "import-complete";
    saveManifest();

    const finalCounts = await countKnownCollections(db);
    const preExistingDocuments = await verifyPreExistingDocuments(db, backup.manifest, backup.backupDir);
    const insertedDocuments = await verifyInsertedDocuments(db, manifest);
    const relationshipValidation = await verifyCharacterRelationships(
      db,
      manifest.importResults.characters?.insertedIds || [],
    );

    const postImportVerification = {
      checkedAt: new Date().toISOString(),
      database: databaseName,
      finalCounts,
      preExistingDocuments,
      insertedDocuments,
      relationshipValidation,
      apiChecks: null,
      issues: [],
    };

    for (const [name, result] of Object.entries(preExistingDocuments)) {
      if (result.missingIds.length || result.changedIds.length) {
        postImportVerification.issues.push(`${name} has missing or changed pre-existing documents`);
      }
    }
    for (const [name, result] of Object.entries(insertedDocuments)) {
      if (result.missingIds.length || result.modelValidation.invalid.length) {
        postImportVerification.issues.push(`${name} inserted document verification failed`);
      }
    }
    if (!relationshipValidation.valid) {
      postImportVerification.issues.push("character relatedContent verification failed");
    }

    postImportVerification.apiChecks = await runApiChecks();
    for (const [name, check] of Object.entries(postImportVerification.apiChecks)) {
      if (!check.consumable) {
        postImportVerification.issues.push(`${name} API response was not consumable`);
      }
    }

    writeJson(verificationPath, postImportVerification);
    writeRollbackPlan(path.join(manifestDir, "ROLLBACK_PLAN.md"), manifest.rollbackPlan);

    manifest.completedAt = new Date().toISOString();
    manifest.status = postImportVerification.issues.length ? "completed-with-verification-issues" : "completed";
    saveManifest();

    console.log(JSON.stringify({
      status: manifest.status,
      manifestPath,
      backupDir: manifest.backup.backupDir,
      inserted: Object.fromEntries(Object.entries(manifest.importResults).map(([name, result]) => [name, result.insertedCount])),
      skipped: Object.fromEntries(Object.entries(manifest.importResults).map(([name, result]) => [name, result.skipped.length])),
      finalCounts,
      verificationIssues: postImportVerification.issues,
    }, null, 2));
  } catch (error) {
    manifest.completedAt = new Date().toISOString();
    manifest.status = "failed";
    manifest.errors.push(error.message);
    saveManifest();
    throw error;
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(`Phase 1 import failed: ${error.message}`);
  process.exit(1);
});
