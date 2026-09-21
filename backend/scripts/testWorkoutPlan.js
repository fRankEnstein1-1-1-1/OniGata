// scripts/testInsertPlan.js
require("dotenv").config();
const mongoose = require("mongoose");
const WorkoutPlan = require("../models/WorkoutPlan");

const run = async () => {
    await mongoose.connect(process.env.MONGO);

    const plan = await WorkoutPlan.create({
        user: "6aad8bde76b294ee62c3849c",
        weekNumber: 1,
        tier: 1,
        days: []
    });

    console.log("Created plan:", plan);
    process.exit(0);
};

run();