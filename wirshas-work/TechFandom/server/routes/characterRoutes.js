const router = require("express").Router();
const { getCharacters, getCharacterById } = require("../controllers/characterController");

router.get("/", getCharacters);
router.get("/:id", getCharacterById);

module.exports = router;
