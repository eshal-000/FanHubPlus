const router = require("express").Router();

const { protect, requireRole } = require("../middleware/auth");

const { adminLogin } = require("../controllers/adminAuthController");
const { getStats } = require("../controllers/adminStatsController");
const { getUsers, updateUserRole } = require("../controllers/adminUserController");
const { createCrudController } = require("../controllers/adminCrudController");
const { prepareContentPayload } = require("../controllers/contentController");

const Article = require("../models/Article");
const Category = require("../models/Category");
const Character = require("../models/Character");
const Content = require("../models/Content");
const Event = require("../models/Event");
const Release = require("../models/Release");
const Merch = require("../models/Merch");
const Feedback = require("../models/Feedback");
const Submission = require("../models/Submission");

router.post("/auth/login", adminLogin);

router.use(protect, requireRole("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id", updateUserRole);

const RESOURCES = {
  categories: {
    Model: Category,
    filterKeys: ["status", "slug"],
    searchable: ["name", "slug", "description", "shortDescription"],
    sortDefault: { sortOrder: 1, name: 1 },
  },
  contents: {
    Model: Content,
    filterKeys: ["categorySlug", "status", "type"],
    searchable: ["title", "description", "body", "tags"],
    sortDefault: { createdAt: -1 },
    prepareBody: prepareContentPayload,
    bulk: {
      publish: { status: "published" },
      unpublish: { status: "draft" },
      delete: "delete",
    },
  },
  characters: {
    Model: Character,
    filterKeys: ["categorySlug", "status", "series"],
    searchable: ["name", "series", "bio", "tags"],
    sortDefault: { createdAt: -1 },
  },
  articles: {
    Model: Article,
    filterKeys: ["categorySlug", "status", "author"],
    searchable: ["title", "excerpt", "body", "author", "tags"],
    sortDefault: { createdAt: -1 },
  },
  submissions: {
    Model: Submission,
    filterKeys: ["category", "status", "fandom"],
    searchable: ["title", "body", "fandom", "adminNote"],
    sortDefault: { createdAt: -1 },
  },
  events: {
    Model: Event,
    filterKeys: ["city", "eventType"],
    searchable: ["title", "city", "address"],
    sortDefault: { startDate: -1 },
  },
  releases: {
    Model: Release,
    filterKeys: ["releaseType", "fandom", "category", "status"],
    searchable: ["title", "category"],
    sortDefault: { releaseDate: 1 },
  },
  merch: {
    Model: Merch,
    filterKeys: ["fandom", "category", "isUpcoming"],
    searchable: ["name", "description", "tags"],
  },
  feedback: {
    Model: Feedback,
    filterKeys: ["status", "type"],
    searchable: ["subject", "message", "name", "email"],
    bulk: {
      resolve: { status: "resolved" },
      reopen: { status: "open" },
      "in-progress": { status: "in-progress" },
      delete: "delete",
    },
  },
};

for (const [resource, cfg] of Object.entries(RESOURCES)) {
  const c = createCrudController(cfg);
  router.get(`/${resource}`, c.getAll);
  router.post(`/${resource}`, c.create);
  router.post(`/${resource}/bulk`, c.bulkAction);
  router.put(`/${resource}/:id`, c.update);
  router.patch(`/${resource}/:id`, c.update);
  router.delete(`/${resource}/:id`, c.remove);
}

module.exports = router;
