const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/Authmiddleware");
const uploadMiddleware = require("../middleware/Uploadmiddleware");
const { uploadPhotos } = require("../controllers/photoController");

router.post(
    "/upload",
    authMiddleware,
    uploadMiddleware,
    (req, res, next) => {
        console.log("REQ.FILES:", req.files);
        console.log("REQ.BODY:", req.body);
        next();
    },
    uploadPhotos
);

module.exports = router;