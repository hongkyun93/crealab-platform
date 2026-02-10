
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Hack to access model management if available, or just try to generate with a known model
    // The SDK doesn't always expose listModels directly in the main class in older versions, 
    // but let's try the standard way if it exists in 0.24.1

    // Actually, for listModels we might need to use the GoogleGenerativeAI.getGenerativeModel factory? 
    // No, usually it's on a ModelManager or similar.
    // Let's try to just run a generation with gemini-1.5-flash-latest and see if it works.

    try {
        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("gemini-1.5-flash works! Response:", result.response.text());
    } catch (e) {
        console.error("gemini-1.5-flash failed:", e.message);
    }

    try {
        console.log("Testing gemini-1.5-flash-latest...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Hello");
        console.log("gemini-1.5-flash-latest works! Response:", result.response.text());
    } catch (e) {
        console.error("gemini-1.5-flash-latest failed:", e.message);
    }

    try {
        console.log("Testing gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("gemini-pro works! Response:", result.response.text());
    } catch (e) {
        console.error("gemini-pro failed:", e.message);
    }
}

listModels();
