const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  getBookmarks,
  addBookmark,
  updateBookmark,
  removeBookmark,
} = require("../controllers/bookmarkController");

router.use(protect);
router.get("/", getBookmarks);
router.post("/", addBookmark);
router.put("/:id", updateBookmark);
router.delete("/:itemId", removeBookmark);

module.exports = router;
