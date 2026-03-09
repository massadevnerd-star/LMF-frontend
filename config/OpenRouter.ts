/*import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    dangerouslyAllowBrowser: true,
});

export default openai;
*/

import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", // Optional, for including your app on openrouter.ai rankings.
        "X-Title": "Le Mie Storie", // Optional. Shows in rankings on openrouter.ai.
    }
});

export default openai;
