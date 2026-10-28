const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        gender: {
            type: String,

            enum: ["male", "female", "other"]
        },

        level: {
            type: String,

            enum: ["beginner", "intermediate", "advanced"]
        },

        target: {
            type: String,

            trim: true
        },

        age: {
            type: Number,

            min: 13
        },

        workoutDays: {
            type: Number,
            default: 1,
            min: 1,
            max: 7
        },

        hasInjury: {
            type: Boolean,

            default: false
        },

        injuryDetails: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);
const User = mongoose.model("User", userSchema)
module.exports = User;