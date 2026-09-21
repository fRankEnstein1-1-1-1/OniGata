const mongoose = require("mongoose");

const workoutLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        workoutPlan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkoutPlan",
            required: true
        },
        dayNumber: { type: Number, required: true },
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true
        },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date }
    },
    { timestamps: true }
);

module.exports = mongoose.model("WorkoutLog", workoutLogSchema);