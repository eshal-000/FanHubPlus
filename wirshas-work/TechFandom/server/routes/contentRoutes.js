const router = require("express").Router();
const { getContent } = require("../controllers/contentController");

router.get("/", getContent);

module.exports = router;
