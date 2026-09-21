const mongoose = require("mongoose");

const exerciseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    targetMuscle: {
        type: String,
        required: true
    },
    equipment: {
        type: String,
        default: "bodyweight"
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("Exercise", exerciseSchema);