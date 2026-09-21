require("dotenv").config();
const mongoose = require("mongoose");
const Exercise = require("../models/Exercise")

const exercises = [
    { name: "Push-ups", targetMuscle: "chest", equipment: "bodyweight" },
    { name: "Pull-ups", targetMuscle: "back", equipment: "bodyweight" },
    { name: "Bodyweight Squats", targetMuscle: "legs", equipment: "bodyweight" },
    { name: "Plank", targetMuscle: "core", equipment: "bodyweight" },
    { name: "Lunges", targetMuscle: "legs", equipment: "bodyweight" },
    { name: "Dumbbell Shoulder Press", targetMuscle: "shoulders", equipment: "dumbbell" },
    { name: "Lateral Raises", targetMuscle: "shoulders", equipment: "dumbbell" },
    { name: "Bent-over Rows", targetMuscle: "back", equipment: "dumbbell" },
    { name: "Bicep Curls", targetMuscle: "arms", equipment: "dumbbell" },
    { name: "Tricep Dips", targetMuscle: "arms", equipment: "bodyweight" }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Connected to MongoDB");

        await Exercise.deleteMany({}); // clear existing before reseeding
        const inserted = await Exercise.insertMany(exercises);

        console.log(`Seeded ${inserted.length} exercises`);
        process.exit(0);
    } catch (error) {
        console.error("Seed failed:", error);
        process.exit(1);
    }
};

seed();