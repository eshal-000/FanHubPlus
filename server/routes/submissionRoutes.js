const router = require("express").Router();

const {
  createSubmission,
  deleteSubmission,
  getAllSubmissions,
  getMySubmissions,
  getSubmissionById,
  updateSubmissionStatus,
} = require("../controllers/submissionController");
const { protect, requireRole } = require("../middleware/auth");

router.post("/", protect, createSubmission);
router.get("/mine", protect, getMySubmissions);

router.get("/", protect, requireRole("admin"), getAllSubmissions);
router.get("/:id", protect, requireRole("admin"), getSubmissionById);
router.patch("/:id", protect, requireRole("admin"), updateSubmissionStatus);
router.delete("/:id", protect, requireRole("admin"), deleteSubmission);

module.exports = router;
