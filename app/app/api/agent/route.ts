import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentResponse } from "../../types/api";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { userMessage } = await req.json();
    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json<AgentResponse>({ error: "Missing userMessage" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(userMessage);
    const response = result.response.text();

    return NextResponse.json<AgentResponse>({ response });
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json<AgentResponse>({ error: "Connection lost." }, { status: 500 });
  }
}
