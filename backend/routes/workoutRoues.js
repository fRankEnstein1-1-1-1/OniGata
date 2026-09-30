const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/Authmiddleware");
const { generateNewWeek } = require("../controllers/workoutController");

router.post("/generate", authMiddleware, generateNewWeek);

module.exports = router;