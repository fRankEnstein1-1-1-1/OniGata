const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/Authmiddleware");
const { generateNewWeek, getCurrentPlan, toggleLog } = require("../controllers/workoutController");

router.post("/generate", authMiddleware, generateNewWeek);
router.get("/current", authMiddleware, getCurrentPlan);
router.patch("/log/:logId", authMiddleware, toggleLog);

module.exports = router;