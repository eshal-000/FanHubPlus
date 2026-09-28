const router = require("express").Router();
const { getMerch, getMerchById } = require("../controllers/merchController");

router.get("/", getMerch);
router.get("/:id", getMerchById);

module.exports = router;
