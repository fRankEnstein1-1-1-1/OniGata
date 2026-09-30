// scripts/fixPhotosField.js
require("dotenv").config();
const mongoose = require("mongoose");
const FitnessProfile = require("../models/FitnessProfile");

const run = async () => {
    await mongoose.connect(process.env.MONGO);

    await FitnessProfile.updateOne(
        { user: "6aad8bde76b294ee62c3849c" },
        { $set: { photos: { baseline: [], previous: [], current: [] } } }
    );

    console.log("Fixed");
    process.exit(0);
};

run();