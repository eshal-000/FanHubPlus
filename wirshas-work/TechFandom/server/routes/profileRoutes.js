const router = require("express").Router();
const protect = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/profileController");

router.use(protect);
router.get("/", getProfile);
router.put("/", updateProfile);

module.exports = router;
