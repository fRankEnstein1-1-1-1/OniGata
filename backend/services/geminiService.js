const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const axios = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models are tried in this order
const GEMINI_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash"
];

console.log(
    "GEMINI_API_KEY loaded:",
    process.env.GEMINI_API_KEY ? "yes" : "MISSING"
);


/* =========================================================
   WORKOUT PLAN SCHEMA
========================================================= */

const workoutPlanSchema = {
    type: SchemaType.OBJECT,
    properties: {
        days: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    dayNumber: {
                        type: SchemaType.NUMBER
                    },

                    exercises: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                name: {
                                    type: SchemaType.STRING
                                },

                                targetMuscle: {
                                    type: SchemaType.STRING
                                },

                                sets: {
                                    type: SchemaType.NUMBER
                                },

                                reps: {
                                    type: SchemaType.NUMBER
                                }
                            },

                            required: [
                                "name",
                                "targetMuscle",
                                "sets",
                                "reps"
                            ]
                        }
                    }
                },

                required: [
                    "dayNumber",
                    "exercises"
                ]
            }
        }
    },

    required: ["days"]
};


/* =========================================================
   GENERIC GEMINI FALLBACK FUNCTION
========================================================= */

const generateWithFallback = async ({
    contents,
    generationConfig = {}
}) => {

    let lastError = null;

    for (const modelName of GEMINI_MODELS) {

        try {

            console.log(`Trying Gemini model: ${modelName}`);

            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig
            });

            const result = await model.generateContent(contents);

            console.log(`Success with Gemini model: ${modelName}`);

            return result;

        } catch (error) {

            lastError = error;

            console.error(
                `Gemini model ${modelName} failed:`,
                error.message
            );

            // Try the next model
            console.log("Trying next Gemini model...\n");
        }
    }

    // All models failed
    throw new Error(
        `All Gemini models failed. Last error: ${lastError?.message}`
    );
};


/* =========================================================
   GENERATE WORKOUT PLAN
========================================================= */

const generateWorkoutPlan = async ({
    goal,
    level,
    workoutDays,
    tier,
    focusAreas,
    hasInjury,
    injuryDetails,
    previousSummary,
    baselinePhotos
}) => {

    const prompt = `
You are a fitness coach generating a 7-day workout plan.

Goal: ${goal}
Experience level: ${level}
Training days available per week: ${workoutDays}
Difficulty tier: ${tier} (already decided by the system — do not change it, only generate exercises appropriate for this tier)
Focus muscle groups: ${focusAreas.join(", ")}
Injury/limitations: ${hasInjury ? injuryDetails : "none"}

${previousSummary
            ? `Notes from previous weeks: ${previousSummary}`
            : ""
        }

${baselinePhotos
            ? "Baseline physique photos are attached. Briefly factor visible body proportions into exercise emphasis within the given focus areas — do not change tier or add new focus areas."
            : "This is the user's first week."
        }

Generate exactly ${workoutDays} training days with 3-6 exercises each,
sets/reps appropriate for tier ${tier}.
`.trim();


    // Prompt is always the first content part
    const contentParts = [prompt];


    // Add baseline physique photos if available
    if (baselinePhotos && baselinePhotos.length > 0) {

        for (const photo of baselinePhotos) {

            contentParts.push({
                inlineData: {
                    data: await urlToBase64(photo.url),
                    mimeType: "image/jpeg"
                }
            });

        }
    }


    // Use the Gemini fallback system
    const result = await generateWithFallback({

        contents: contentParts,

        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: workoutPlanSchema
        }

    });


    return JSON.parse(result.response.text());
};


/* =========================================================
   URL → BASE64
========================================================= */

const urlToBase64 = async (url) => {

    const response = await axios.get(url, {
        responseType: "arraybuffer"
    });

    return Buffer
        .from(response.data)
        .toString("base64");
};


/* =========================================================
   COMPARE PHOTOS
========================================================= */

const comparePhotos = async (
    referenceSet,
    currentSet,
    goal
) => {

    const imageParts = [];
    const labels = [];


    /* ---------- Reference photos ---------- */

    for (const photo of referenceSet) {

        imageParts.push({
            inlineData: {
                data: await urlToBase64(photo.url),
                mimeType: "image/jpeg"
            }
        });

        labels.push(
            `Reference ${photo.angle} view (previous checkpoint)`
        );
    }


    /* ---------- Current photos ---------- */

    for (const photo of currentSet) {

        imageParts.push({
            inlineData: {
                data: await urlToBase64(photo.url),
                mimeType: "image/jpeg"
            }
        });

        labels.push(
            `Current ${photo.angle} view (today)`
        );
    }


    const prompt = `
Images in order:
${labels.join(", then ")}.

Goal: ${goal}.

In 2-3 sentences, note visible physique changes
relevant to this goal, and which target areas still
need more emphasis.
`.trim();


    const result = await generateWithFallback({

        contents: [
            prompt,
            ...imageParts
        ]

    });


    return result.response.text();
};


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
    generateWorkoutPlan,
    comparePhotos
};