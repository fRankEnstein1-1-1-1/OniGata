const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/Authmiddleware");
const { getProgression } = require("../controllers/progressionController");

router.get("/:workoutPlanId", authMiddleware, getProgression);

module.exports = router;