const router = require("express").Router();
const protect = require("../middleware/auth");
const {
  getBookmarks,
  addBookmark,
  removeBookmark,
} = require("../controllers/bookmarkController");

router.use(protect);
router.get("/", getBookmarks);
router.post("/", addBookmark);
router.delete("/:itemId", removeBookmark);

module.exports = router;
