const router = require("express").Router();
const protect = require("../middleware/auth");
const { createSubmission, getMySubmissions } = require("../controllers/submissionController");

router.use(protect);
router.post("/", createSubmission);
router.get("/mine", getMySubmissions);

module.exports = router;
