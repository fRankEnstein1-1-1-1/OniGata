const Fitness = require("../models/FitnessProfile");
const { find, findByIdAndDelete } = require("../models/User");

//create profile
const createProfile = async (req, res) => {
    try {
        const existing = await Fitness.findOne({ user: req.user });
        if (existing) {
            return res.status(400).json({ message: "You already have an profile yo!" })
        }
        const profile = await Fitness.create({
            user: req.user,
            ...req.body
        })
        return res.status(201).json(profile);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

//update profile

const updateProfile = async (req, res) => {
    try {
        const profile = await FitnessProfile.findOneAndUpdate(
            { user: req.user },
            req.body,
            { new: true, runValidators: true }
        );
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.json(profile);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

//get profile

const getProfile = async (req, res) => {
    try {
        const profile = await Fitness.findOne({ user: req.user });
        if (!profile) {
            return res.status(201).json({ message: "Please complete your profile" });
        }
        return res.status(400).json(profile);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

//delete Profile
// delete Profile
const deleteProfile = async (req, res) => {
    try {
        const profile = await FitnessProfile.findOneAndDelete({ user: req.user });
        if (!profile) {
            return res.status(404).json({ message: "No Profile found" });
        }
        return res.status(200).json({ message: "Profile Deleted" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {
    createProfile,
    updateProfile,
    getProfile,
    deleteProfile
}