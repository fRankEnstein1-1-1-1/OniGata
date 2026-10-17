const WorkoutPlan = require("../models/WorkoutPlan");
const FitnessProfile = require("../models/FitnessProfile");
const Exercise = require("../models/Exercise");
const { generateWorkoutPlan } = require("../services/geminiService");
const { calculateAdherence, determineNextTier } = require("../services/progressionService");
const WorkoutLog = require("../models/WorkoutLog")

// temporary stub — real lookup table comes later, before frontend
const FOCUS_AREAS = {
    "V-shaped taper": ["lats", "shoulders", "chest"]
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
        //


        // in generateNewWeek, right after: const newPlan = await WorkoutPlan.create(...)
        const logs = days.flatMap(day =>
            day.exercises.map(ex => ({
                user: req.user,
                workoutPlan: newPlan._id,
                dayNumber: day.dayNumber,
                exercise: ex.exercise,
                completed: false
            }))
        );
        await WorkoutLog.insertMany(logs);
        res.status(201).json(newPlan);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/workout/current
const getCurrentPlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findOne({ user: req.user })
            .sort({ weekNumber: -1 })
            .populate("days.exercises.exercise");
        if (!plan) {
            return res.status(404).json({ message: "No plan yet" });
        }
        const logs = await WorkoutLog.find({ user: req.user, workoutPlan: plan._id });
        res.json({ plan, logs });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// PATCH /api/workout/log/:logId
const toggleLog = async (req, res) => {
    try {
        const log = await WorkoutLog.findOneAndUpdate(
            { _id: req.params.logId, user: req.user },
            { completed: req.body.completed, completedAt: req.body.completed ? new Date() : null },
            { new: true }
        );
        if (!log) {
            return res.status(404).json({ message: "Log not found" });
        }
        res.json(log);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { generateNewWeek, getCurrentPlan, toggleLog };