const WorkoutLog = require("../models/WorkoutLog");
// Calculates adherence % for a given user + workoutPlan
const calculateAdherence = async (userId, workoutPlanId) => {
    const logs = await WorkoutLog.find({ user: userId, workoutPlan: workoutPlanId });

    if (logs.length === 0) return 0;

    const completedCount = logs.filter(log => log.completed).length;
    return completedCount / logs.length;
};

// Deterministic tier decision — AI never touches this
const determineNextTier = (currentTier, adherence) => {
    if (adherence >= 0.75) {
        return currentTier + 1;
    }
    if (adherence < 0.40) {
        return Math.max(1, currentTier - 1);
    }
    return currentTier; // hold
};

module.exports = { calculateAdherence, determineNextTier };