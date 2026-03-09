import { GoogleGenAI } from "@google/genai";

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.warn("Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable");
}

const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
});

export default ai;
