const router = require("express").Router();

const {
  createContent,
  deleteContent,
  getContentByIdentifier,
  getContents,
  updateContent,
} = require("../controllers/contentController");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getContents);
router.get("/:identifier", getContentByIdentifier);

router.post("/", protect, requireRole("admin"), createContent);
router.put("/:id", protect, requireRole("admin"), updateContent);
router.delete("/:id", protect, requireRole("admin"), deleteContent);

module.exports = router;
