const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const repoRoot = path.resolve(__dirname, "..", "..");
const runStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
const runId = `phase2-isolated-tests-${runStamp}`;
const testDbName = `fanhubplus_phase2_test_${runStamp.toLowerCase()}`;
const outDir = path.join(repoRoot, "database-import-manifests", runId);
const reportPath = path.join(outDir, "PHASE2_ISOLATED_TEST_REPORT.json");

if (testDbName === "fanhubplus" || !testDbName.startsWith("fanhubplus_phase2_test_")) {
  throw new Error(`Unsafe test database name: ${testDbName}`);
}

process.env.NODE_ENV = "test";
process.env.MONGODB_DB_NAME = testDbName;
process.env.MONGOOSE_AUTO_CREATE = "true";
process.env.MONGOOSE_AUTO_INDEX = "true";
process.env.JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

const app = require("../server");
const User = require("../models/User");
const Article = require("../models/Article");
const Character = require("../models/Character");
const Content = require("../models/Content");
const Media = require("../models/Media");
const Merch = require("../models/Merch");
const Feedback = require("../models/Feedback");
const Submission = require("../models/Submission");
const Rating = require("../models/Rating");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function objectId(value) {
  return value?.toString ? value.toString() : String(value || "");
}

function makePassword() {
  return `P2-${crypto.randomBytes(12).toString("hex")}`;
}

function makeEmail(label) {
  return `${label}-${runStamp.toLowerCase()}@example.test`;
}

function expect(condition, message) {
  assert.ok(condition, message);
}

async function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function stopServer(server) {
  if (!server) return;
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

async function http(baseUrl, method, url, { token, body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }
  return { status: response.status, ok: response.ok, data };
}

async function createBookmarkTargets() {
  const article = await Article.create({
    title: `Phase 2 Article ${runStamp}`,
    category: "News",
    categorySlug: "anime",
    fandom: "Anime",
    body: "A test article for isolated bookmark verification.",
    status: "published",
  });

  const character = await Character.create({
    name: `Phase 2 Character ${runStamp}`,
    category: "Protagonist",
    categorySlug: "anime",
    fandom: "Anime",
    status: "published",
  });

  const content = await Content.create({
    title: `Phase 2 Content ${runStamp}`,
    category: "Anime",
    categorySlug: "anime",
    fandom: "Anime",
    body: "A test content record for isolated bookmark verification.",
    type: "article",
    status: "published",
  });

  const media = await Media.create({
    title: `Phase 2 Media ${runStamp}`,
    mediaType: "video",
    embedUrl: "https://example.test/embed/phase2",
    category: "Movies",
    fandom: "Movies",
    releaseYear: 2026,
  });

  const merch = await Merch.create({
    name: `Phase 2 Hoodie ${runStamp}`,
    fandom: "Gaming",
    category: "Apparel",
    images: ["https://example.test/phase2-hoodie.jpg"],
    tags: ["Collectible"],
    description: "An isolated merch record used only by Phase 2 tests.",
  });

  return { article, character, content, media, merch };
}

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGODB_URI/MONGO_URI in server .env.");

  ensureDir(outDir);

  const report = {
    runId,
    database: testDbName,
    liveDatabaseTouched: false,
    generatedAt: new Date().toISOString(),
    checks: [],
    cleanup: { attempted: false, droppedGeneratedTestDatabase: false },
  };

  function pass(name, details = {}) {
    report.checks.push({ name, status: "pass", ...details });
  }

  let server;
  try {
    await mongoose.connect(uri, {
      dbName: testDbName,
      autoCreate: true,
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });
    await Promise.all(Object.values(mongoose.models).map((model) => model.init()));

    server = await startServer();
    const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

    const userAPassword = makePassword();
    const userBPassword = makePassword();
    const adminPassword = makePassword();

    await User.create({
      name: "Phase 2 Admin",
      email: makeEmail("phase2-admin"),
      passwordHash: adminPassword,
      role: "admin",
    });

    const registerA = await http(baseUrl, "POST", "/auth/register", {
      body: { name: "Phase 2 User A", email: makeEmail("phase2-user-a"), password: userAPassword },
    });
    expect(registerA.status === 201, "registered user A");
    expect(mongoose.isValidObjectId(registerA.data.user._id), "registered user A has a valid MongoDB ObjectId");
    const tokenA = registerA.data.token;
    const userAId = registerA.data.user._id;
    pass("Registration creates a valid MongoDB ObjectId and returns a JWT-backed session");

    const registerB = await http(baseUrl, "POST", "/auth/register", {
      body: { name: "Phase 2 User B", email: makeEmail("phase2-user-b"), password: userBPassword },
    });
    expect(registerB.status === 201, "registered user B");
    const tokenB = registerB.data.token;
    const userBId = registerB.data.user._id;

    const loginA = await http(baseUrl, "POST", "/auth/login", {
      body: { email: makeEmail("phase2-user-a"), password: userAPassword },
    });
    expect(loginA.status === 200 && loginA.data.user._id === userAId, "login returns user A");
    pass("Login authenticates with the existing User model and JWT flow");

    const profileA = await http(baseUrl, "GET", "/profile", { token: tokenA });
    expect(profileA.status === 200 && profileA.data.user._id === userAId, "profile identifies user A");
    const profileB = await http(baseUrl, "GET", "/profile", { token: tokenB });
    expect(profileB.status === 200 && profileB.data.user._id === userBId, "profile identifies user B");
    const profileGuest = await http(baseUrl, "GET", "/profile");
    expect(profileGuest.status === 401, "profile rejects unauthenticated requests");
    pass("Protected routes identify the currently logged-in user and reject guests");

    const adminLogin = await http(baseUrl, "POST", "/admin/auth/login", {
      body: { email: makeEmail("phase2-admin"), password: adminPassword },
    });
    expect(adminLogin.status === 200 && adminLogin.data.user.role === "admin", "admin login works");
    const adminToken = adminLogin.data.token;
    const userAdminAttempt = await http(baseUrl, "GET", "/admin/stats", { token: tokenA });
    expect(userAdminAttempt.status === 403, "non-admin cannot access admin stats");
    const adminStats = await http(baseUrl, "GET", "/admin/stats", { token: adminToken });
    expect(adminStats.status === 200, "admin can access admin stats");
    pass("Role authorization protects admin routes");

    const targets = await createBookmarkTargets();
    const bookmarkTargets = [
      { itemType: "article", itemId: objectId(targets.article._id), accessPath: `/articles/${targets.article._id}` },
      { itemType: "character", itemId: objectId(targets.character._id), accessPath: `/characters/${targets.character._id}` },
      { itemType: "content", itemId: objectId(targets.content._id), accessPath: `/contents/${targets.content._id}` },
      { itemType: "video", itemId: objectId(targets.content._id), accessPath: `/contents/${targets.content._id}` },
      { itemType: "media", itemId: objectId(targets.media._id), accessPath: `/media/${targets.media._id}` },
      { itemType: "merch", itemId: objectId(targets.merch._id), accessPath: `/merch/${targets.merch._id}` },
    ];

    for (const target of bookmarkTargets) {
      const response = await http(baseUrl, "POST", "/bookmarks", {
        token: tokenA,
        body: { itemType: target.itemType, itemId: target.itemId },
      });
      expect(response.status === 201, `bookmark ${target.itemType} created`);

      const access = await http(baseUrl, "GET", target.accessPath);
      expect(access.status === 200, `bookmarked ${target.itemType} target is accessible`);
    }

    const duplicateBookmark = await http(baseUrl, "POST", "/bookmarks", {
      token: tokenA,
      body: { itemType: "article", itemId: objectId(targets.article._id), note: "updated" },
    });
    expect(duplicateBookmark.status === 201, "duplicate bookmark upsert response is successful");

    const bookmarksA = await http(baseUrl, "GET", "/bookmarks", { token: tokenA });
    expect(bookmarksA.status === 200 && bookmarksA.data.count === 6, "user A sees six unique bookmarks");
    const bookmarksB = await http(baseUrl, "GET", "/bookmarks", { token: tokenB });
    expect(bookmarksB.status === 200 && bookmarksB.data.count === 0, "user B cannot see user A bookmarks");

    await http(baseUrl, "DELETE", `/bookmarks/${targets.article._id}`, {
      token: tokenB,
      body: { itemType: "article" },
    });
    const afterWrongUserDelete = await http(baseUrl, "GET", "/bookmarks", { token: tokenA });
    expect(afterWrongUserDelete.data.count === 6, "user B cannot delete user A bookmark");
    const ownDelete = await http(baseUrl, "DELETE", `/bookmarks/${targets.article._id}`, {
      token: tokenA,
      body: { itemType: "article" },
    });
    expect(ownDelete.status === 200, "user A can delete own bookmark");
    const afterOwnDelete = await http(baseUrl, "GET", "/bookmarks", { token: tokenA });
    expect(afterOwnDelete.data.count === 5, "own bookmark deletion is reflected");
    pass("Bookmarks support article, character, content, video, media and merch targets with user ownership");

    const feedbackAuth = await http(baseUrl, "POST", "/feedback", {
      token: tokenA,
      body: {
        type: "suggestion",
        subject: "Phase 2 authenticated feedback",
        message: "This authenticated feedback verifies user association.",
        rating: 5,
      },
    });
    expect(feedbackAuth.status === 201, "authenticated feedback created");
    const savedAuthFeedback = await Feedback.findById(feedbackAuth.data.feedback._id).lean();
    expect(objectId(savedAuthFeedback.userId) === userAId, "authenticated feedback is associated to user A");

    const feedbackGuest = await http(baseUrl, "POST", "/feedback", {
      body: {
        type: "bug",
        subject: "Phase 2 guest feedback",
        message: "This guest feedback verifies anonymous support.",
        name: "Phase 2 Guest",
        email: makeEmail("phase2-guest"),
      },
    });
    expect(feedbackGuest.status === 201, "guest feedback created");
    const savedGuestFeedback = await Feedback.findById(feedbackGuest.data.feedback._id).lean();
    expect(savedGuestFeedback.userId == null, "guest feedback keeps userId null");

    const feedbackAdminPatch = await http(baseUrl, "PATCH", `/admin/feedback/${feedbackAuth.data.feedback._id}`, {
      token: adminToken,
      body: { status: "resolved", adminNote: "Handled in isolated Phase 2 test." },
    });
    expect(feedbackAdminPatch.status === 200 && feedbackAdminPatch.data.status === "resolved", "admin can update feedback status");
    pass("Feedback supports guest and authenticated submissions plus admin status management");

    const submissionOne = await http(baseUrl, "POST", "/submissions", {
      token: tokenA,
      body: {
        title: "Phase 2 submission approve path",
        category: "anime",
        fandom: "Phase 2",
        body: "This submission has enough content to satisfy validation and test approval flow.",
        imageUrl: "https://example.test/submission-one.jpg",
      },
    });
    expect(submissionOne.status === 201, "submission one created");
    const submissionTwo = await http(baseUrl, "POST", "/submissions", {
      token: tokenA,
      body: {
        title: "Phase 2 submission reject path",
        category: "gaming",
        fandom: "Phase 2",
        body: "This second submission has enough content to satisfy validation and test rejection flow.",
        imageUrl: "https://example.test/submission-two.jpg",
      },
    });
    expect(submissionTwo.status === 201, "submission two created");

    const mineA = await http(baseUrl, "GET", "/submissions/mine", { token: tokenA });
    expect(mineA.status === 200 && mineA.data.count === 2, "user A sees own submissions");
    const mineB = await http(baseUrl, "GET", "/submissions/mine", { token: tokenB });
    expect(mineB.status === 200 && mineB.data.count === 0, "user B does not see user A submissions");
    const userAllSubmissions = await http(baseUrl, "GET", "/submissions", { token: tokenA });
    expect(userAllSubmissions.status === 403, "non-admin cannot list all submissions");
    const adminSubmissions = await http(baseUrl, "GET", "/submissions", { token: adminToken });
    expect(adminSubmissions.status === 200 && adminSubmissions.data.count === 2, "admin can list submissions");
    const approve = await http(baseUrl, "PATCH", `/submissions/${submissionOne.data.submission._id}`, {
      token: adminToken,
      body: { status: "approved" },
    });
    expect(approve.status === 200 && approve.data.submission.status === "published", "admin approval publishes submission");
    expect(mongoose.isValidObjectId(approve.data.submission.publishedContentId), "published submission links public content");
    const reject = await http(baseUrl, "PATCH", `/submissions/${submissionTwo.data.submission._id}`, {
      token: adminToken,
      body: { status: "rejected" },
    });
    expect(reject.status === 200 && reject.data.submission.status === "rejected", "admin can reject submission");
    const directContentCount = await Content.countDocuments({ sourceSubmissionId: submissionOne.data.submission._id });
    expect(directContentCount === 1, "submission approval creates one linked public content record");
    pass("Submissions are user-scoped and admin approval/rejection is role protected with publication");

    const ratingGuest = await http(baseUrl, "GET", `/media/${targets.media._id}/rating`);
    expect(ratingGuest.status === 200 && ratingGuest.data.ratingCount === 0, "guest can read media rating stats");
    const ratingGuestPost = await http(baseUrl, "POST", `/media/${targets.media._id}/rating`, {
      body: { value: 4 },
    });
    expect(ratingGuestPost.status === 401, "guest cannot write media rating");
    const ratingInvalid = await http(baseUrl, "POST", `/media/${targets.media._id}/rating`, {
      token: tokenA,
      body: { value: 6 },
    });
    expect(ratingInvalid.status === 400, "invalid rating value is rejected");
    const ratingA = await http(baseUrl, "POST", `/media/${targets.media._id}/rating`, {
      token: tokenA,
      body: { value: 4 },
    });
    expect(ratingA.status === 200 && ratingA.data.data.value === 4, "user A creates media rating");
    const ratingAUpdate = await http(baseUrl, "POST", `/media/${targets.media._id}/rating`, {
      token: tokenA,
      body: { value: 5 },
    });
    expect(ratingAUpdate.status === 200 && ratingAUpdate.data.data.value === 5, "user A updates media rating");
    const ratingCountA = await Rating.countDocuments({ mediaId: targets.media._id, userId: userAId });
    expect(ratingCountA === 1, "duplicate ratings are prevented for same user/media through upsert");
    const ratingB = await http(baseUrl, "POST", `/media/${targets.media._id}/rating`, {
      token: tokenB,
      body: { value: 3 },
    });
    expect(ratingB.status === 200, "user B creates separate rating");
    const ratingStatsA = await http(baseUrl, "GET", `/media/${targets.media._id}/rating`, { token: tokenA });
    expect(ratingStatsA.status === 200 && ratingStatsA.data.ratingCount === 2 && ratingStatsA.data.userRating === 5, "rating stats include current user's rating");
    pass("Media ratings require auth for writes, reference existing media/users, and prevent duplicate user-media ratings");

    report.completedAt = new Date().toISOString();
    report.status = "passed";
  } catch (error) {
    report.completedAt = new Date().toISOString();
    report.status = "failed";
    report.error = error.message;
    throw error;
  } finally {
    await stopServer(server);
    if (mongoose.connection.readyState === 1) {
      const dbName = mongoose.connection.db.databaseName;
      report.cleanup.attempted = true;
      if (dbName.startsWith("fanhubplus_phase2_test_")) {
        await mongoose.connection.db.dropDatabase();
        report.cleanup.droppedGeneratedTestDatabase = true;
      }
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    writeJson(reportPath, report);
    console.log(JSON.stringify({
      status: report.status,
      reportPath,
      database: report.database,
      checksPassed: report.checks.filter((check) => check.status === "pass").length,
      cleanup: report.cleanup,
    }, null, 2));
  }
}

main().catch((error) => {
  console.error(`Phase 2 isolated tests failed: ${error.message}`);
  process.exit(1);
});
