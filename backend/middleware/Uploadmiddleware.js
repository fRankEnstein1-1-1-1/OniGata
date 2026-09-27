const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// expects fields named "front" and "side"
module.exports = upload.fields([
    { name: "front", maxCount: 1 },
    { name: "side", maxCount: 1 }
]);