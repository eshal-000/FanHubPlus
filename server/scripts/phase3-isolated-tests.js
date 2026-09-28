const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const repoRoot = path.resolve(__dirname, "..", "..");
const runStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
const runId = `phase3-isolated-tests-${runStamp}`;
const testDbName = `fanhubplus_phase3_test_${runStamp.toLowerCase()}`;
const outDir = path.join(repoRoot, "database-import-manifests", runId);
const reportPath = path.join(outDir, "PHASE3_ISOLATED_TEST_REPORT.json");

if (testDbName === "fanhubplus" || !testDbName.startsWith("fanhubplus_phase3_test_")) {
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
const Content = require("../models/Content");
const Submission = require("../models/Submission");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function expect(condition, message) {
  assert.ok(condition, message);
}

function objectId(value) {
  return value?.toString ? value.toString() : String(value || "");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function makeEmail(label) {
  return `${label}-${runStamp.toLowerCase()}@example.test`;
}

function makePassword() {
  return `P3-${crypto.randomBytes(12).toString("hex")}`;
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
  return { data, ok: response.ok, status: response.status };
}

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGODB_URI/MONGO_URI in server .env.");

  ensureDir(outDir);

  const report = {
    runId,
    database: testDbName,
    generatedAt: new Date().toISOString(),
    liveDatabaseTouched: false,
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

    const adminPassword = makePassword();
    const userPassword = makePassword();
    const resetPassword = makePassword();
    const adminEmail = makeEmail("phase3-admin");
    const userEmail = makeEmail("phase3-user");

    await User.create({
      name: "Phase 3 Admin",
      email: adminEmail,
      passwordHash: adminPassword,
      role: "admin",
    });

    const register = await http(baseUrl, "POST", "/auth/register", {
      body: { name: "Phase 3 User", email: userEmail, password: userPassword },
    });
    expect(register.status === 201, "regular user registered");
    const userId = register.data.user._id;
    const userToken = register.data.token;

    const adminLogin = await http(baseUrl, "POST", "/admin/auth/login", {
      body: { email: adminEmail, password: adminPassword },
    });
    expect(adminLogin.status === 200 && adminLogin.data.user.role === "admin", "admin login works");
    const adminToken = adminLogin.data.token;

    const resetToken = crypto.randomBytes(24).toString("hex");
    await User.findByIdAndUpdate(userId, {
      passwordResetExpires: Date.now() + 15 * 60 * 1000,
      passwordResetTokenHash: sha256(resetToken),
    });
    const reset = await http(baseUrl, "POST", `/auth/reset-password/${resetToken}`, {
      body: { password: resetPassword },
    });
    expect(reset.status === 200, "password reset succeeds with valid token");
    const loginAfterReset = await http(baseUrl, "POST", "/auth/login", {
      body: { email: userEmail, password: resetPassword },
    });
    expect(loginAfterReset.status === 200 && loginAfterReset.data.user._id === userId, "login succeeds after password reset");
    const freshUserToken = loginAfterReset.data.token;
    pass("Password reset flow updates credentials without live database writes");

    const profileUpdate = await http(baseUrl, "PUT", "/profile", {
      token: freshUserToken,
      body: {
        favoriteFandoms: ["Anime", "Gaming"],
        interests: ["reviews", "trailers"],
        displayPreferences: { theme: "light", fontScale: "large", reduceMotion: true },
      },
    });
    expect(profileUpdate.status === 200, "profile update succeeds");
    expect(profileUpdate.data.user.displayPreferences.fontScale === "large", "fontScale preference is persisted");
    expect(profileUpdate.data.user.displayPreferences.theme === "light", "theme preference is persisted");
    pass("Profile display preferences persist theme, motion and font-size settings");

    const maliciousSubmission = await http(baseUrl, "POST", "/submissions", {
      token: userToken,
      body: {
        title: `Phase 3 malicious status guard ${runStamp}`,
        category: "anime",
        fandom: "Anime",
        body: "This verifies that users cannot self-publish by sending status fields.",
        imageUrl: "https://example.test/phase3-guard.jpg",
        status: "published",
        publishedModel: "Article",
      },
    });
    expect(maliciousSubmission.status === 201, "submission with extra status fields is accepted as pending");
    expect(maliciousSubmission.data.submission.status === "pending", "user supplied status is ignored");
    expect(!maliciousSubmission.data.submission.publishedModel, "user supplied publication model is ignored");
    pass("User submission creation keeps publication fields admin-controlled");

    const approve = await http(baseUrl, "PATCH", `/submissions/${maliciousSubmission.data.submission._id}`, {
      token: adminToken,
      body: { status: "approved", adminNote: "Approved in isolated Phase 3 test." },
    });
    expect(approve.status === 200, "admin approval request succeeds");
    expect(approve.data.submission.status === "published", "approved submission is marked published after public record creation");
    expect(approve.data.submission.publishedModel === "Content", "default approval publishes to public Content");
    expect(mongoose.isValidObjectId(approve.data.submission.publishedContentId), "published content id is linked");

    const publishedContentId = approve.data.submission.publishedContentId;
    const publicContent = await Content.findById(publishedContentId).lean();
    expect(publicContent.status === "published", "linked content is public");
    expect(objectId(publicContent.sourceSubmissionId) === maliciousSubmission.data.submission._id, "content links back to source submission");
    expect(objectId(publicContent.submittedBy) === userId, "content preserves source user reference");

    const duplicateApprove = await http(baseUrl, "PATCH", `/submissions/${maliciousSubmission.data.submission._id}`, {
      token: adminToken,
      body: { status: "approved" },
    });
    expect(duplicateApprove.status === 200, "repeat approval succeeds");
    expect(duplicateApprove.data.submission.publishedContentId === publishedContentId, "repeat approval reuses the existing content id");
    const duplicateContentCount = await Content.countDocuments({ sourceSubmissionId: maliciousSubmission.data.submission._id });
    expect(duplicateContentCount === 1, "repeat approval does not create duplicate public content");

    const contentSearch = await http(baseUrl, "GET", `/contents?search=${encodeURIComponent("malicious status guard")}`);
    expect(contentSearch.status === 200 && contentSearch.data.contents.length === 1, "published content appears in public search");
    const contentFilter = await http(baseUrl, "GET", "/contents?category=anime&sort=latest");
    expect(
      contentFilter.status === 200
        && contentFilter.data.contents.some((item) => item._id === publishedContentId),
      "published content appears in category/latest filters",
    );
    pass("Admin approval publishes exactly one linked public Content record and makes it searchable");

    const articleSubmission = await http(baseUrl, "POST", "/submissions", {
      token: freshUserToken,
      body: {
        title: `Phase 3 article publish target ${runStamp}`,
        category: "News",
        fandom: "Movies",
        body: "This verifies the optional Article publishing target for admin-driven review.",
        imageUrl: "https://example.test/phase3-article.jpg",
      },
    });
    expect(articleSubmission.status === 201, "article-target submission created");
    const publishArticle = await http(baseUrl, "PATCH", `/submissions/${articleSubmission.data.submission._id}`, {
      token: adminToken,
      body: { status: "approved", publishAs: "article" },
    });
    expect(publishArticle.status === 200, "article-target approval succeeds");
    expect(publishArticle.data.submission.publishedModel === "Article", "article-target approval links an Article");
    const linkedArticle = await Article.findById(publishArticle.data.submission.publishedArticleId).lean();
    expect(linkedArticle.status === "published", "linked article is public");
    expect(linkedArticle.imageUrl === "https://example.test/phase3-article.jpg", "article imageUrl is mapped");
    expect(Array.isArray(linkedArticle.imageUrls) && linkedArticle.imageUrls[0] === linkedArticle.imageUrl, "article imageUrls is mapped");
    pass("Admin can explicitly publish reviewed submissions as public Articles with image mappings");

    const rejectSubmission = await http(baseUrl, "POST", "/submissions", {
      token: freshUserToken,
      body: {
        title: `Phase 3 reject target ${runStamp}`,
        category: "gaming",
        fandom: "Gaming",
        body: "This verifies rejection does not create public content.",
        imageUrl: "https://example.test/phase3-reject.jpg",
      },
    });
    expect(rejectSubmission.status === 201, "reject-target submission created");
    const reject = await http(baseUrl, "PATCH", `/submissions/${rejectSubmission.data.submission._id}`, {
      token: adminToken,
      body: { status: "rejected" },
    });
    expect(reject.status === 200 && reject.data.submission.status === "rejected", "admin rejection succeeds");
    const rejectedPublicCount = await Content.countDocuments({ sourceSubmissionId: rejectSubmission.data.submission._id });
    expect(rejectedPublicCount === 0, "rejected submission does not create public content");

    const unpublish = await http(baseUrl, "PATCH", `/submissions/${maliciousSubmission.data.submission._id}`, {
      token: adminToken,
      body: { status: "rejected" },
    });
    expect(unpublish.status === 200 && unpublish.data.submission.status === "rejected", "published submission can be rejected later");
    const hiddenContent = await Content.findById(publishedContentId).lean();
    expect(hiddenContent.status === "draft", "linked public content is hidden when a published submission is rejected");
    const hiddenSearch = await http(baseUrl, "GET", `/contents?search=${encodeURIComponent("malicious status guard")}`);
    expect(hiddenSearch.status === 200 && hiddenSearch.data.contents.length === 0, "hidden content no longer appears in public search");
    pass("Rejected submissions do not appear as public content, including after a prior publish");

    const mine = await http(baseUrl, "GET", "/submissions/mine", { token: freshUserToken });
    expect(mine.status === 200 && mine.data.count === 3, "users can review their own submission states");
    const adminList = await http(baseUrl, "GET", "/submissions?status=published", { token: adminToken });
    expect(adminList.status === 200, "admin can filter submissions by published status");
    pass("Submission ownership and admin filtering remain intact after publication changes");

    const submissionCount = await Submission.countDocuments({});
    report.counts = {
      articles: await Article.countDocuments({}),
      contents: await Content.countDocuments({}),
      submissions: submissionCount,
      users: await User.countDocuments({}),
    };
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
      if (dbName.startsWith("fanhubplus_phase3_test_")) {
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
  console.error(`Phase 3 isolated tests failed: ${error.message}`);
  process.exit(1);
});
