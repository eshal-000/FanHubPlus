const router = require("express").Router();

const {
  createCharacter,
  deleteCharacter,
  getCharacterById,
  getCharacters,
  updateCharacter,
} = require("../controllers/characterController");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getCharacters);
router.get("/:id", getCharacterById);

router.post("/", protect, requireRole("admin"), createCharacter);
router.put("/:id", protect, requireRole("admin"), updateCharacter);
router.delete("/:id", protect, requireRole("admin"), deleteCharacter);

module.exports = router;
