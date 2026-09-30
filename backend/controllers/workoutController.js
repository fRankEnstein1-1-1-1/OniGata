const WorkoutPlan = require("../models/WorkoutPlan");
const FitnessProfile = require("../models/FitnessProfile");
const Exercise = require("../models/Exercise");
const { generateWorkoutPlan } = require("../services/geminiService");
const { calculateAdherence, determineNextTier } = require("../services/progressionService");

// temporary stub — real lookup table comes later, before frontend
const FOCUS_AREAS = {
    "V-shaped taper": ["lats", "shoulders", "core"]
};

const getOrCreateExercise = async (name, targetMuscle) => {
    let exercise = await Exercise.findOne({ name });
    if (!exercise) {
        exercise = await Exercise.create({ name, targetMuscle });
    }
    return exercise;
};

// POST /api/workout/generate
const generateNewWeek = async (req, res) => {
    try {
        const profile = await FitnessProfile.findOne({ user: req.user });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const lastPlan = await WorkoutPlan.findOne({ user: req.user }).sort({ weekNumber: -1 });

        let tier = 1;
        let weekNumber = 1;

        if (lastPlan) {
            const adherence = await calculateAdherence(req.user, lastPlan._id);
            tier = determineNextTier(lastPlan.tier, adherence);
            weekNumber = lastPlan.weekNumber + 1;
        }

        const focusAreas = FOCUS_AREAS[profile.target] || ["full body"];

        // inside generateNewWeek, where aiPlan is generated:
        const aiPlan = await generateWorkoutPlan({
            goal: profile.target,
            level: profile.level,
            workoutDays: profile.workoutDays,
            tier,
            focusAreas,
            hasInjury: profile.hasInjury,
            injuryDetails: profile.injuryDetails,
            previousSummary: profile.progressNotes.slice(-1)[0] || null,
            baselinePhotos: !lastPlan && profile.photos.baseline.length > 0 ? profile.photos.baseline : null
        });

        const days = [];
        for (const day of aiPlan.days) {
            const exercises = [];
            for (const ex of day.exercises) {
                const exerciseDoc = await getOrCreateExercise(ex.name, ex.targetMuscle);
                exercises.push({ exercise: exerciseDoc._id, sets: ex.sets, reps: ex.reps });
            }
            days.push({ dayNumber: day.dayNumber, exercises });
        }

        const newPlan = await WorkoutPlan.create({ user: req.user, weekNumber, tier, days });
        res.status(201).json(newPlan);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { generateNewWeek };