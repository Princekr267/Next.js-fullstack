import { GoogleGenAI, ApiError } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.VITE_GOOGLE_GEMINI_API_KEY });

        const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the question are intriguiling, foster curiosity, and contribute to a positive and welcoming conversational environment"

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return NextResponse.json({ questions: response.text }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) {
            // Gemini API specific error (invalid key, quota exceeded, bad request, etc.)
            console.error("Gemini API error:", error.message);
            return NextResponse.json(
                { error: error.message },
                { status: error.status ?? 500 }
            );
        } else {
            // Generic/unexpected error
            console.error("An unexpected error occurred:", error);
            return NextResponse.json(
                { error: "An unexpected error occurred" },
                { status: 500 }
            );
        }
    }
}

