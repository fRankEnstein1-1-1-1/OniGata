const mongoose = require("mongoose");
const FitnessProfile = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true // one profile per user
    },
    gender: {
        type: String,
        //required: true
    },
    age: {
        type: Number,
        // required: true
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        // required: true
    },
    target: {
        type: String,
        //  required: true
    },
    workoutDays: {
        type: Number,
        //  required: true
    },
    hasInjury: {
        type: Boolean,
        default: false
    },
    injuryDetails: {
        type: String,
        default: ""
    },
    height: {
        type: Number
    },
    weight: {
        type: Number
    },
    photos: {
        type: [String], // Cloudinary URLs, added later
        default: []
    },
    currentTier: {
        type: Number,
        default: 1
    }
},
    {
        timestamps: true
    }
);
const Fitness = mongoose.model("FitnessProfile", FitnessProfile);
module.exports = Fitness;

