const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const FitnessProfile = require("../models/FitnessProfile");
const { comparePhotos } = require("../services/geminiService");

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "onigata/photos", transformation: [{ width: 768, crop: "limit" }] },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};



const compareWithGemini = async (referenceSet, currentSet, goal) => {
    return await comparePhotos(referenceSet, currentSet, goal);
};
// POST /api/photos/upload
const uploadPhotos = async (req, res) => {
    try {
        const profile = await FitnessProfile.findOne({ user: req.user });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        if (!req.files || (!req.files.front && !req.files.side)) {
            return res.status(400).json({ message: "No photos provided" });
        }

        const uploadedSet = [];
        for (const angle of ["front", "side"]) {
            if (req.files[angle]) {
                const url = await uploadToCloudinary(req.files[angle][0].buffer);
                uploadedSet.push({ angle, url });
            }
        }

        const isFirstUpload = profile.photos.baseline.length === 0;

        if (isFirstUpload) {
            profile.photos.baseline = uploadedSet;
            await profile.save();
            return res.status(201).json({ message: "Baseline photos saved", photos: uploadedSet });
        }

        // not the first upload — this is a new "current" set
        profile.photos.current = uploadedSet;
        await profile.save();

        const referenceSet = profile.photos.previous.length > 0
            ? profile.photos.previous
            : profile.photos.baseline;

        const comparison = await compareWithGemini(referenceSet, uploadedSet, profile.target);
        profile.progressNotes.push(comparison);

        // only rotate storage after a successful comparison
        const oldPreviousUrls = profile.photos.previous.map(p => p.url);
        for (const url of oldPreviousUrls) {
            const publicId = url.split("/").slice(-1)[0].split(".")[0];
            await cloudinary.uploader.destroy(`onigata/photos/${publicId}`).catch(() => { });
        }

        profile.photos.previous = profile.photos.current;
        profile.photos.current = [];
        await profile.save();

        res.json({ message: "Photos uploaded and compared", comparison });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { uploadPhotos };