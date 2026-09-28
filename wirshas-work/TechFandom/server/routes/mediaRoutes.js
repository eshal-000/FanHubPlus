const router = require("express").Router();
const { getMedia } = require("../controllers/mediaController");

router.get("/", getMedia);

module.exports = router;
