const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/Uploadmiddleware");
const { uploadPhotos } = require("../controllers/photoController");

router.post("/upload", authMiddleware, uploadMiddleware, uploadPhotos);

module.exports = router;