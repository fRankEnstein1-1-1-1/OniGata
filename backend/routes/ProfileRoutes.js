const express = require("express");
const router = express.Router();
const { createProfile, updateProfile, getProfile, deleteProfile } = require("../controllers/ProfileController");
const authMiddleware = require("../middleware/Authmiddleware");

router.post("/create", authMiddleware, createProfile);
router.put("/update", authMiddleware, updateProfile);
router.get("/get", authMiddleware, getProfile);
router.delete("/delete", authMiddleware, deleteProfile);
module.exports = router;