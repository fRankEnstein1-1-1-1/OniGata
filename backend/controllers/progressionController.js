
const WorkoutPlan = require("../models/WorkoutPlan");
const { calculateAdherence, determineNextTier } = require("../services/progressionService");

// GET /api/progression/:workoutPlanId
const getProgression = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findOne({
            _id: req.params.workoutPlanId,
            user: req.user
        });

        if (!plan) {
            return res.status(404).json({ message: "Workout plan not found" });
        }

        const adherence = await calculateAdherence(req.user, plan._id);
        const nextTier = determineNextTier(plan.tier, adherence);

        res.json({
            currentTier: plan.tier,
            adherence,
            nextTier
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getProgression };