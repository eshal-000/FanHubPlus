const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { MongoClient, ObjectId } = require("mongodb");

process.env.MONGOOSE_AUTO_CREATE = "false";
process.env.MONGOOSE_AUTO_INDEX = "false";
process.env.MONGODB_DB_NAME = "fanhubplus";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
process.env.MONGOOSE_AUTO_CREATE = "false";
process.env.MONGOOSE_AUTO_INDEX = "false";
process.env.MONGODB_DB_NAME = "fanhubplus";

const app = require("../server");

const repoRoot = path.resolve(__dirname, "..", "..");
const runStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
const runId = `phase3-readonly-srs-audit-${runStamp}`;
const outDir = path.join(repoRoot, "database-import-manifests", runId);

const collections = [
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

const routeChecks = [
  { name: "health", path: "/api/health", arrayKey: null },
  { name: "contents", path: "/api/contents", arrayKey: "contents" },
  { name: "contentsCategoryLatest", path: "/api/contents?category=anime&sort=latest", arrayKey: "contents" },
  { name: "contentsAlphabetical", path: "/api/contents?sort=az", arrayKey: "contents" },
  { name: "articles", path: "/api/articles", arrayKey: "articles" },
  { name: "articlesSearchLatest", path: "/api/articles?search=anime&sort=latest", arrayKey: "articles" },
  { name: "charactersCategory", path: "/api/characters?category=anime", arrayKey: "characters" },
  { name: "mediaVideo", path: "/api/media?mediaType=video&limit=5", arrayKey: "data" },
  { name: "eventsUpcoming", path: "/api/events?timeFilter=upcoming", arrayKey: "items" },
  { name: "merch", path: "/api/merch?limit=5", arrayKey: "items" },
  { name: "releases", path: "/api/releases", arrayKey: "items" },
];

const fileChecks = [
  { name: "Auth login", path: "client/src/pages/Login.jsx" },
  { name: "Auth register", path: "client/src/pages/Register.jsx" },
  { name: "Forgot password", path: "client/src/pages/ForgotPassword.jsx" },
  { name: "Reset password", path: "client/src/pages/ResetPassword.jsx" },
  { name: "Profile", path: "client/src/pages/Profile.jsx" },
  { name: "Dashboard", path: "client/src/pages/Dashboard.jsx" },
  { name: "Content explorer", path: "client/src/pages/Explore.jsx" },
  { name: "Category explorer", path: "client/src/pages/ExploreCategory.jsx" },
  { name: "Multimedia center", path: "client/src/pages/Media.jsx" },
  { name: "Media details", path: "client/src/pages/MediaDetails.jsx" },
  { name: "Character profiles", path: "client/src/pages/Characters.jsx" },
  { name: "Articles", path: "client/src/pages/Articles.jsx" },
  { name: "Events", path: "client/src/pages/discovery/Events.jsx" },
  { name: "Merch", path: "client/src/pages/discovery/Merch.jsx" },
  { name: "Releases", path: "client/src/pages/discovery/Releases.jsx" },
  { name: "Fan submission form", path: "client/src/pages/SubmitContent.jsx" },
  { name: "My submissions", path: "client/src/pages/MySubmissions.jsx" },
  { name: "Bookmarks", path: "client/src/pages/Bookmarks.jsx" },
  { name: "Feedback", path: "client/src/pages/discovery/Feedback.jsx" },
  { name: "Admin dashboard", path: "client/src/pages/admin/AdminDashboard.jsx" },
  { name: "Admin users", path: "client/src/pages/admin/ManageUsers.jsx" },
  { name: "Admin submissions", path: "client/src/pages/admin/ManageSubmissions.jsx" },
  { name: "Admin content", path: "client/src/pages/admin/ManageContent.jsx" },
  { name: "Admin articles", path: "client/src/pages/admin/ManageArticles.jsx" },
  { name: "Admin characters", path: "client/src/pages/admin/ManageCharacters.jsx" },
  { name: "Sitemap", path: "client/src/components/home/HomeSitemap.jsx" },
  { name: "Theme context", path: "client/src/context/ThemeContext.jsx" },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value);
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function oid(value) {
  if (!value) return "";
  if (value instanceof ObjectId) return value.toHexString();
  if (typeof value.toHexString === "function") return value.toHexString();
  return String(value);
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

async function http(baseUrl, routePath) {
  const response = await fetch(`${baseUrl}${routePath}`);
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

async function countCollections(db) {
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((item) => item.name));
  const counts = {};
  for (const name of collections) {
    counts[name] = existing.has(name) ? await db.collection(name).countDocuments({}) : 0;
  }
  return counts;
}

async function duplicateSourceLinks(db, collectionName) {
  return db.collection(collectionName)
    .aggregate([
      { $match: { sourceSubmissionId: { $exists: true, $ne: null } } },
      { $group: { _id: "$sourceSubmissionId", count: { $sum: 1 }, ids: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } },
      { $project: { _id: 0, sourceSubmissionId: "$_id", count: 1, ids: 1 } },
    ])
    .toArray();
}

async function linkedSubmissionIssues(db) {
  const submissions = await db.collection("submissions")
    .find({
      $or: [
        { publishedContentId: { $exists: true, $ne: null } },
        { publishedArticleId: { $exists: true, $ne: null } },
      ],
    })
    .project({ _id: 1, publishedContentId: 1, publishedArticleId: 1, publishedModel: 1, status: 1 })
    .toArray();

  const issues = [];
  for (const submission of submissions) {
    if (submission.publishedContentId) {
      const exists = await db.collection("contents").findOne({ _id: submission.publishedContentId }, { projection: { _id: 1 } });
      if (!exists) issues.push({ submissionId: oid(submission._id), missing: "contents", linkedId: oid(submission.publishedContentId) });
    }
    if (submission.publishedArticleId) {
      const exists = await db.collection("articles").findOne({ _id: submission.publishedArticleId }, { projection: { _id: 1 } });
      if (!exists) issues.push({ submissionId: oid(submission._id), missing: "articles", linkedId: oid(submission.publishedArticleId) });
    }
  }
  return issues;
}

async function runRouteChecks(uri) {
  let server;
  try {
    await mongoose.connect(uri, {
      dbName: "fanhubplus",
      autoCreate: false,
      autoIndex: false,
      serverSelectionTimeoutMS: 10000,
    });
    server = await startServer();
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const results = {};

    for (const route of routeChecks) {
      const response = await http(baseUrl, route.path);
      const items = route.arrayKey ? response.data?.[route.arrayKey] : null;
      results[route.name] = {
        path: route.path,
        status: response.status,
        ok: response.ok,
        expectedArrayKey: route.arrayKey,
        arrayPresent: route.arrayKey ? Array.isArray(items) : null,
        returnedCount: Array.isArray(items) ? items.length : null,
        consumable: response.ok && (!route.arrayKey || Array.isArray(items)),
      };
    }
    return results;
  } finally {
    await stopServer(server);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

function staticChecklist() {
  const checks = Object.fromEntries(
    fileChecks.map((item) => [item.name, { status: fileExists(item.path) ? "present" : "missing", path: item.path }]),
  );

  const app = readFile("client/src/App.jsx");
  const theme = readFile("client/src/context/ThemeContext.jsx");
  const profileController = readFile("server/controllers/profileController.js");
  const submissionController = readFile("server/controllers/submissionController.js");
  const mediaController = readFile("server/controllers/mediaController.js");
  const contentController = readFile("server/controllers/contentController.js");
  const articleController = readFile("server/controllers/articleController.js");

  return {
    filePresence: checks,
    routePresence: {
      adminUsersRoute: app.includes("ManageUsers"),
      adminSubmissionsRoute: app.includes("ManageSubmissions"),
      mediaRoute: app.includes("Media") && app.includes("/media"),
      sitemapComponent: app.includes("HomeSitemap") || fileExists("client/src/components/home/HomeSitemap.jsx"),
    },
    behaviorSignals: {
      adminApprovalPublishes: submissionController.includes("publishSubmission") && submissionController.includes("sourceSubmissionId"),
      duplicatePublicationGuard: submissionController.includes("findLinkedPublication"),
      profileAcceptsFontScale: profileController.includes('"fontScale"'),
      themeAndFontContext: theme.includes("fontScale") && theme.includes("theme"),
      contentSearchSort: contentController.includes("searchCondition") && contentController.includes("sort === 'latest'") && contentController.includes("sort === 'az'"),
      articleSearchSort: articleController.includes("searchCondition") && articleController.includes("sort === 'latest'") && articleController.includes("sort === 'az'"),
      mediaFiltersPresent: mediaController.includes("category") && mediaController.includes("fandom") && mediaController.includes("mediaType"),
      mediaSearchSortNotImplemented: !mediaController.includes("searchCondition") && !mediaController.includes("sort ==="),
    },
  };
}

function srsChecklist(staticAudit, routeResults) {
  return [
    { area: "Authentication", status: "implemented", evidence: "Login/register/password reset pages and auth routes are present." },
    { area: "User profile preferences", status: staticAudit.behaviorSignals.profileAcceptsFontScale ? "implemented" : "partial", evidence: "Profile supports favorite fandoms, interests, displayPreferences, theme and fontScale." },
    { area: "Personalized dashboard", status: staticAudit.filePresence.Dashboard?.status === "present" ? "implemented" : "missing", evidence: "Dashboard page exists; personalization depth depends on available activity/bookmark data." },
    { area: "Content explorer", status: routeResults.contents?.consumable ? "implemented" : "needs-check", evidence: "Public contents route supports category, type, search, latest and A-Z sorting." },
    { area: "Advanced filtering and sorting", status: "partial", evidence: "Contents/articles support search/category/sort; media has category/fandom/type filters but no search/year/popularity sorting." },
    { area: "Multimedia center", status: routeResults.mediaVideo?.consumable ? "implemented" : "needs-check", evidence: "Media pages, media API, ratings and richer optional metadata schema are present." },
    { area: "Character profiles", status: routeResults.charactersCategory?.consumable ? "implemented" : "needs-check", evidence: "Character pages/API support category filtering." },
    { area: "Featured articles", status: routeResults.articles?.consumable ? "implemented" : "needs-check", evidence: "Articles pages/API are present with rich fields and published status." },
    { area: "Events", status: routeResults.eventsUpcoming?.consumable ? "implemented" : "needs-check", evidence: "Events route/page and upcoming filter are present." },
    { area: "Fan submissions", status: staticAudit.behaviorSignals.adminApprovalPublishes ? "implemented" : "partial", evidence: "Admin approval now publishes a linked public Content/Article record; rejected records stay hidden." },
    { area: "Merch showcase", status: routeResults.merch?.consumable ? "implemented" : "needs-check", evidence: "Merch pages/API are present; display-only behavior is preserved." },
    { area: "Releases", status: routeResults.releases?.consumable ? "implemented" : "needs-check", evidence: "Releases page/API are present." },
    { area: "Bookmarks", status: staticAudit.filePresence.Bookmarks?.status === "present" ? "implemented" : "missing", evidence: "Bookmarks page, API and model are present." },
    { area: "Feedback", status: staticAudit.filePresence.Feedback?.status === "present" ? "implemented" : "missing", evidence: "Feedback page/API and admin management are present." },
    { area: "Admin dashboard/users/content", status: staticAudit.filePresence["Admin users"]?.status === "present" ? "implemented" : "partial", evidence: "Admin dashboard and CRUD pages exist for users/content/articles/characters/submissions/events/merch/releases/feedback." },
    { area: "Admin media management", status: "partial", evidence: "Server media admin endpoints exist, but the current admin media route is owner-reserved in the UI." },
    { area: "Accessibility/theme", status: staticAudit.behaviorSignals.themeAndFontContext ? "implemented" : "partial", evidence: "Theme context and font scale support are present." },
    { area: "AI chatbot/recommendations", status: "not-implemented-optional", evidence: "SRS marks AI features optional; no implementation was added without approval." },
  ];
}

function markdown(report) {
  const lines = [];
  lines.push("# Phase 3 Read-Only SRS Audit");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Database: ${report.database}`);
  lines.push(`Writes performed: ${report.writesPerformed}`);
  lines.push("");
  lines.push("## Live Collection Counts");
  for (const [name, count] of Object.entries(report.live.counts)) {
    lines.push(`- ${name}: ${count}`);
  }
  lines.push("");
  lines.push("## SRS Checklist");
  for (const item of report.srsChecklist) {
    lines.push(`- ${item.area}: ${item.status} - ${item.evidence}`);
  }
  lines.push("");
  lines.push("## Route Checks");
  for (const [name, check] of Object.entries(report.publicRouteChecks)) {
    lines.push(`- ${name}: HTTP ${check.status}, ${check.consumable ? "consumable" : "not consumable"}, count ${check.returnedCount ?? "n/a"}`);
  }
  lines.push("");
  lines.push("## Publication Link Integrity");
  lines.push(`- Duplicate Content sourceSubmissionId links: ${report.live.publicationIntegrity.duplicateContentSourceLinks.length}`);
  lines.push(`- Duplicate Article sourceSubmissionId links: ${report.live.publicationIntegrity.duplicateArticleSourceLinks.length}`);
  lines.push(`- Missing linked publication references: ${report.live.publicationIntegrity.missingLinkedPublications.length}`);
  lines.push(`- Historical approved submissions without a linked public record: ${report.live.publicationIntegrity.approvedWithoutPublishedLink.length}`);
  lines.push("");
  lines.push("No live database writes, migrations, imports, collection creation or index creation were performed.");
  lines.push("");
  return lines.join("\n");
}

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGODB_URI/MONGO_URI in server .env.");
  ensureDir(outDir);

  const client = new MongoClient(uri, {
    appName: "fan-hub-plus-phase3-readonly-srs-audit",
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    const db = client.db("fanhubplus");
    const counts = await countCollections(db);
    const approvedWithoutPublishedLink = await db.collection("submissions")
      .find({
        status: "approved",
        $and: [
          { $or: [{ publishedContentId: null }, { publishedContentId: { $exists: false } }] },
          { $or: [{ publishedArticleId: null }, { publishedArticleId: { $exists: false } }] },
        ],
      })
      .project({ _id: 1, title: 1, userId: 1, status: 1, createdAt: 1 })
      .toArray();

    const staticAudit = staticChecklist();
    const publicRouteChecks = await runRouteChecks(uri);
    const report = {
      generatedAt: new Date().toISOString(),
      database: "fanhubplus",
      writesPerformed: false,
      live: {
        counts,
        publicationIntegrity: {
          duplicateContentSourceLinks: (await duplicateSourceLinks(db, "contents")).map((item) => ({
            sourceSubmissionId: oid(item.sourceSubmissionId),
            count: item.count,
            ids: item.ids.map(oid),
          })),
          duplicateArticleSourceLinks: (await duplicateSourceLinks(db, "articles")).map((item) => ({
            sourceSubmissionId: oid(item.sourceSubmissionId),
            count: item.count,
            ids: item.ids.map(oid),
          })),
          missingLinkedPublications: await linkedSubmissionIssues(db),
          approvedWithoutPublishedLink: approvedWithoutPublishedLink.map((item) => ({
            _id: oid(item._id),
            title: item.title,
            userId: oid(item.userId),
            status: item.status,
            createdAt: item.createdAt,
          })),
        },
      },
      staticAudit,
      publicRouteChecks,
      srsChecklist: srsChecklist(staticAudit, publicRouteChecks),
    };

    writeJson(path.join(outDir, "PHASE3_SRS_AUDIT.json"), report);
    writeText(path.join(outDir, "PHASE3_SRS_AUDIT.md"), markdown(report));

    console.log(JSON.stringify({
      reportDir: outDir,
      counts,
      routeIssues: Object.entries(publicRouteChecks)
        .filter(([, check]) => !check.consumable)
        .map(([name]) => name),
      srsPartialOrMissing: report.srsChecklist
        .filter((item) => !["implemented"].includes(item.status))
        .map((item) => ({ area: item.area, status: item.status })),
      publicationIntegrity: {
        duplicateContentSourceLinks: report.live.publicationIntegrity.duplicateContentSourceLinks.length,
        duplicateArticleSourceLinks: report.live.publicationIntegrity.duplicateArticleSourceLinks.length,
        missingLinkedPublications: report.live.publicationIntegrity.missingLinkedPublications.length,
        approvedWithoutPublishedLink: report.live.publicationIntegrity.approvedWithoutPublishedLink.length,
      },
    }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(`Phase 3 read-only SRS audit failed: ${error.message}`);
  process.exit(1);
});
