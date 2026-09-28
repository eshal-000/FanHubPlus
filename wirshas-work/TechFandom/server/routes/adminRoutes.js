const router = require("express").Router();

const protect = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

const { adminLogin } = require("../controllers/adminAuthController");
const { getStats } = require("../controllers/adminStatsController");
const { getUsers, updateUserRole } = require("../controllers/adminUserController");
const { createCrudController } = require("../controllers/adminCrudController");

const Character = require("../models/Character");
const Article = require("../models/Article");
const Content = require("../models/Content");
const Media = require("../models/Media");
const Event = require("../models/Event");
const Release = require("../models/Release");
const Merch = require("../models/Merch");
const Submission = require("../models/Submission");
const Feedback = require("../models/Feedback");

router.post("/auth/login", adminLogin);

router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id", updateUserRole);

const RESOURCES = {
  characters: {
    Model: Character,
    filterKeys: ["fandom", "category"],
    searchable: ["name", "bio", "traits"],
  },
  articles: {
    Model: Article,
    filterKeys: ["fandom", "category", "status", "featured"],
    searchable: ["title", "excerpt", "author"],
  },
  content: {
    Model: Content,
    filterKeys: ["category", "type"],
    searchable: ["title", "description"],
  },
  media: {
    Model: Media,
    filterKeys: ["fandom", "category", "mediaType"],
    searchable: ["title", "tags"],
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
  submissions: {
    Model: Submission,
    filterKeys: ["status", "fandom"],
    searchable: ["title", "body"],
    bulk: {
      approve: { status: "approved" },
      reject: { status: "rejected" },
      reviewed: { adminNote: "Reviewed by admin" },
      publish: { status: "published" },
      delete: "delete",
    },
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
