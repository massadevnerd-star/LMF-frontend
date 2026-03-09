'use server'

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Initialize Google GenAI Client
// We re-initialize here to ensure it works in the server action context
const ai = new GoogleGenAI({
    apiKey: apiKey || "",
});

export interface StoryParams {
    storySubject: string;
    storyType: string;
    ageGroup: string;
    imageStyle: string;
}

const JSON_STRUCTURE = `
        {
          "title": "Story Title",
          "cover_image_prompt": "Detailed description for cover...",
          "chapters": [
            {
              "chapter_number": 1,
              "chapter_title": "Chapter Title",
              "text": "Story text...",
              "image_prompt": "Detailed description for chapter image..."
            }
          ]
        }
`;

export async function generateStory(data: StoryParams | { prompt: string }) {
    try {
        console.log("Generating Story via Google GenAI SDK...");
        console.log("API Key Present:", !!apiKey, "Length:", apiKey?.length);

        if (!apiKey) {
            throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY");
        }

        let systemPrompt = `You are a creative story writer for children.
        IMPORTANT: You must return the result strictly in valid JSON format matching this structure:
        ${JSON_STRUCTURE}
        Do not include any markdown formatting like \`\`\`json ... \`\`\`, just the raw JSON object.`;

        let userPrompt = "";

        if ('prompt' in data && data.prompt) {
            userPrompt = data.prompt;
        } else {
            const params = data as StoryParams;
            userPrompt = `
             Create a kids story based on:
             Target Audience: ${params.ageGroup} years old
             Type: ${params.storyType}
             Style: ${params.imageStyle}
             Subject: ${params.storySubject}

             Requirements:
             - Exactly 5 chapters.
             - For each chapter, provide a detailed image prompt suitable for AI (Midjourney/DALL-E) in the style of ${params.imageStyle}.
             - Provide a cover image prompt.
             - Return STRICTLY valid JSON.
             `;
        }

        const model = "gemini-1.5-flash";
        // Note: Check if the model name is correct for the SDK version. 
        // Usually 'gemini-2.5-flash-image' or 'gemini-2.0-flash-exp'. 
        // We stick to the one the user was trying to use, but fallback if needed.

        const result = await ai.models.generateContent({
            model: model,
            contents: [
                { role: 'user', parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
            ],
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = result.text;
        console.log("Raw GenAI Response:", text?.substring(0, 100) + "...");

        if (!text) throw new Error("No content generated");

        // Clean up markdown just in case, even with responseMimeType
        const cleanJson = text.replace(/```json\n?|```/g, "").trim();
        const storyData = JSON.parse(cleanJson);

        return { success: true, data: storyData };

    } catch (error: any) {
        console.error("Story Generation Error:", error);
        console.error("Error String:", String(error));
        return { success: false, error: error.message || String(error) };
    }
}
