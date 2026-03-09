import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { prompt } = data;

        console.log("Generating Image via Replicate...");

        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error("Missing REPLICATE_API_TOKEN");
        }

        const output = await replicate.run(
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            {
                input: {
                    prompt: prompt,
                    width: 1024,
                    height: 1024,
                    refine: "expert_ensemble_refiner",
                }
            }
        );

        console.log("Replicate Output:", output);

        // Replicate returns an array of strings (URLs) usually
        if (Array.isArray(output) && output.length > 0) {
            return NextResponse.json({ imageUrl: output[0] });
        } else if (typeof output === 'string') {
            return NextResponse.json({ imageUrl: output });
        } else {
            throw new Error("Invalid response from Replicate");
        }

    } catch (e: any) {
        console.error("Image Gen Error:", e);
        return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
    }
}