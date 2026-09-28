const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const repoRoot = path.resolve(__dirname, "..", "..");
const runStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
const runId = `auth-bookmark-isolated-tests-${runStamp}`;
const testDbName = `fhp_authbm_${runStamp.toLowerCase()}`;
const outDir = path.join(repoRoot, "database-import-manifests", runId);
const reportPath = path.join(outDir, "AUTH_BOOKMARK_ISOLATED_TEST_REPORT.json");

if (testDbName === "fanhubplus" || !testDbName.startsWith("fhp_authbm_")) {
  throw new Error(`Unsafe test database name: ${testDbName}`);
}

process.env.NODE_ENV = "test";
process.env.MONGODB_DB_NAME = testDbName;
process.env.MONGOOSE_AUTO_CREATE = "true";
process.env.MONGOOSE_AUTO_INDEX = "true";
process.env.JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

const app = require("../server");
const User = require("../models/User");
const Content = require("../models/Content");
const Character = require("../models/Character");
const Bookmark = require("../models/Bookmark");

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

function makeEmail(label) {
  return `${label}-${runStamp.toLowerCase()}@example.test`;
}

function makePassword() {
  return `AB-${crypto.randomBytes(12).toString("hex")}`;
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
    body: body === undefined ? undefined : JSON.stringify(body),
    headers,
    method,
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

async function createTargets() {
  const content = await Content.create({
    body: "A temporary isolated content record for bookmark auth tests.",
    category: "Anime",
    categorySlug: "anime",
    description: "Temporary content bookmark target.",
    fandom: "Anime",
    status: "published",
    title: `Auth Bookmark Content ${runStamp}`,
    type: "article",
  });

  const character = await Character.create({
    bio: "Temporary character bookmark target.",
    category: "Hero",
    categorySlug: "anime",
    fandom: "Anime",
    name: `Auth Bookmark Character ${runStamp}`,
    status: "published",
  });

  return { character, content };
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
      autoCreate: true,
      autoIndex: true,
      dbName: testDbName,
      serverSelectionTimeoutMS: 10000,
    });
    await Promise.all(Object.values(mongoose.models).map((model) => model.init()));

    server = await startServer();
    const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

    const adminEmail = makeEmail("admin");
    const adminPassword = makePassword();
    await User.create({
      email: adminEmail,
      name: "Isolated Admin",
      passwordHash: adminPassword,
      role: "admin",
    });

    const userAPassword = makePassword();
    const userBPassword = makePassword();
    const registerA = await http(baseUrl, "POST", "/auth/register", {
      body: {
        email: makeEmail("user-a"),
        name: "Isolated User A",
        password: userAPassword,
        role: "admin",
      },
    });
    expect(registerA.status === 201, "user A registration succeeds");
    expect(registerA.data.user.role === "user", "public registration ignores admin role payload");
    const userAId = registerA.data.user._id;
    const tokenA = registerA.data.token;

    const registerB = await http(baseUrl, "POST", "/auth/register", {
      body: {
        email: makeEmail("user-b"),
        name: "Isolated User B",
        password: userBPassword,
      },
    });
    expect(registerB.status === 201, "user B registration succeeds");
    const tokenB = registerB.data.token;
    pass("Public registration creates normal users only, even when a role is supplied");

    const targets = await createTargets();
    const contentId = objectId(targets.content._id);
    const characterId = objectId(targets.character._id);

    const guestBookmark = await http(baseUrl, "POST", "/bookmarks", {
      body: { itemId: contentId, itemType: "content" },
    });
    expect(guestBookmark.status === 401, "guest bookmark write is rejected");

    const expiredToken = jwt.sign({ id: userAId }, process.env.JWT_SECRET, { expiresIn: -1 });
    const expiredProfile = await http(baseUrl, "GET", "/profile", { token: expiredToken });
    expect(expiredProfile.status === 401, "expired token cannot read profile");
    const expiredBookmark = await http(baseUrl, "POST", "/bookmarks", {
      body: { itemId: contentId, itemType: "content" },
      token: expiredToken,
    });
    expect(expiredBookmark.status === 401, "expired token cannot write bookmark");
    pass("Guests and expired sessions cannot create bookmarks");

    const bookmarkContent = await http(baseUrl, "POST", "/bookmarks", {
      body: { itemId: contentId, itemType: "content" },
      token: tokenA,
    });
    expect(bookmarkContent.status === 201, "user A can bookmark content");
    const bookmarkCharacter = await http(baseUrl, "POST", "/bookmarks", {
      body: { itemId: characterId, itemType: "character" },
      token: tokenA,
    });
    expect(bookmarkCharacter.status === 201, "user A can bookmark character");

    const bookmarksA = await http(baseUrl, "GET", "/bookmarks", { token: tokenA });
    expect(bookmarksA.status === 200 && bookmarksA.data.count === 2, "user A sees own bookmarks");
    const bookmarksB = await http(baseUrl, "GET", "/bookmarks", { token: tokenB });
    expect(bookmarksB.status === 200 && bookmarksB.data.count === 0, "user B sees no user A bookmarks");

    const wrongUserDelete = await http(baseUrl, "DELETE", `/bookmarks/${contentId}`, {
      body: { itemType: "content" },
      token: tokenB,
    });
    expect(wrongUserDelete.status === 200, "wrong-user delete endpoint remains idempotent");
    const afterWrongUserDelete = await http(baseUrl, "GET", "/bookmarks", { token: tokenA });
    expect(afterWrongUserDelete.data.count === 2, "user B cannot delete user A bookmark");

    const duplicateBookmarkCount = await Bookmark.countDocuments({
      itemId: targets.content._id,
      itemType: "content",
      userId: userAId,
    });
    expect(duplicateBookmarkCount === 1, "bookmark ownership query is scoped by userId");
    pass("Bookmarks are scoped to the authenticated user for list and delete operations");

    const normalAdminStats = await http(baseUrl, "GET", "/admin/stats", { token: tokenA });
    expect(normalAdminStats.status === 403, "normal user cannot read admin stats");

    const adminLogin = await http(baseUrl, "POST", "/admin/auth/login", {
      body: { email: adminEmail, password: adminPassword },
    });
    expect(adminLogin.status === 200 && adminLogin.data.user.role === "admin", "admin login returns admin role");
    const adminStats = await http(baseUrl, "GET", "/admin/stats", { token: adminLogin.data.token });
    expect(adminStats.status === 200, "admin can read admin stats");
    pass("Admin APIs reject normal users and accept users whose current DB role is admin");

    await User.findByIdAndUpdate(userAId, { role: "admin" }, { runValidators: true });
    const promotedProfile = await http(baseUrl, "GET", "/profile", { token: tokenA });
    expect(promotedProfile.status === 200 && promotedProfile.data.user.role === "admin", "profile reflects DB role after promotion");
    const promotedAdminStats = await http(baseUrl, "GET", "/admin/stats", { token: tokenA });
    expect(promotedAdminStats.status === 200, "old token can access admin stats after DB promotion");
    const loginAfterPromotion = await http(baseUrl, "POST", "/auth/login", {
      body: { email: registerA.data.user.email, password: userAPassword },
    });
    expect(loginAfterPromotion.status === 200 && loginAfterPromotion.data.user.role === "admin", "fresh login returns promoted admin role");

    await User.findByIdAndUpdate(userAId, { role: "user" }, { runValidators: true });
    const demotedProfile = await http(baseUrl, "GET", "/profile", { token: tokenA });
    expect(demotedProfile.status === 200 && demotedProfile.data.user.role === "user", "profile reflects DB role after demotion");
    const demotedAdminStats = await http(baseUrl, "GET", "/admin/stats", { token: tokenA });
    expect(demotedAdminStats.status === 403, "old token loses admin access after DB demotion");
    pass("Authorization uses the current database role instead of trusting stale JWT/localStorage role claims");

    report.counts = {
      bookmarks: await Bookmark.countDocuments({}),
      characters: await Character.countDocuments({}),
      contents: await Content.countDocuments({}),
      users: await User.countDocuments({}),
    };
    report.completedAt = new Date().toISOString();
    report.status = "passed";
  } catch (error) {
    report.completedAt = new Date().toISOString();
    report.error = error.message;
    report.status = "failed";
    throw error;
  } finally {
    await stopServer(server);
    if (mongoose.connection.readyState === 1) {
      const dbName = mongoose.connection.db.databaseName;
      report.cleanup.attempted = true;
      if (dbName.startsWith("fhp_authbm_")) {
        await mongoose.connection.db.dropDatabase();
        report.cleanup.droppedGeneratedTestDatabase = true;
      }
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    writeJson(reportPath, report);
    console.log(JSON.stringify({
      checksPassed: report.checks.filter((check) => check.status === "pass").length,
      cleanup: report.cleanup,
      database: report.database,
      reportPath,
      status: report.status,
    }, null, 2));
  }
}

main().catch((error) => {
  console.error(`Auth/bookmark isolated tests failed: ${error.message}`);
  process.exit(1);
});
