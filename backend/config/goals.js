// goal -> priority muscle groups, highest priority first
const GOALS = {
    "V-shaped taper": ["lats", "shoulders (side delts)", "upper back", "obliques and core"],
    "Lean muscle gain": ["chest", "back", "legs", "shoulders"],
    "Fat loss": ["full body compounds", "core"],
    "General strength": ["legs", "back", "chest", "shoulders", "core"]
};

// forgiving match so old free-text goals ("v-shaped taper ") still resolve
const getFocusAreas = (target = "") => {
    const key = Object.keys(GOALS).find(
        (g) => g.toLowerCase() === target.trim().toLowerCase()
    );
    return key ? GOALS[key] : ["full body"];
};

module.exports = { GOALS, getFocusAreas };