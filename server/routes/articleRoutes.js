const router = require("express").Router();

const {
  createArticle,
  deleteArticle,
  getArticleById,
  getArticles,
  updateArticle,
} = require("../controllers/articleController");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getArticles);
router.get("/:id", getArticleById);

router.post("/", protect, requireRole("admin"), createArticle);
router.put("/:id", protect, requireRole("admin"), updateArticle);
router.delete("/:id", protect, requireRole("admin"), deleteArticle);

module.exports = router;
