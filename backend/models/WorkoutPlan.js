const mongoose = require("mongoose");

const assignedExerciseSchema = new mongoose.Schema({
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercise",
        required: true
    },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true }
});

const daySchema = new mongoose.Schema({
    dayNumber: { type: Number, required: true }, // 1-7
    exercises: [assignedExerciseSchema]
});

const workoutPlanSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        weekNumber: { type: Number, required: true },
        tier: { type: Number, required: true },
        days: [daySchema]
    },
    { timestamps: true }
);

module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);