const router = require("express").Router();
const { getReleases } = require("../controllers/releaseController");

router.get("/", getReleases);

module.exports = router;
