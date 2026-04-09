import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { cacheVerdict, getCachedVerdict } from "../../lib/verdictCache";

function extractQuery(session: Stripe.Checkout.Session): string {
  // Primary: read from Stripe custom_fields (new flow)
  const field = session.custom_fields?.find((f: any) => f.key === "idea");
  if (field?.text?.value) return field.text.value;
  // Fallback: unpack from metadata (legacy sessions)
  return unpackQuery((session.metadata as Record<string, string>) || {});
}

function getStripeKey(): string {
  try {
    const keyPath = path.join(process.env.HOME || "/home/nous", ".credentials", "stripe_secret.key");
    return fs.readFileSync(keyPath, "utf8").trim();
  } catch {
    return process.env.STRIPE_SECRET_KEY || "";
  }
}

function unpackQuery(metadata: Record<string, string>): string {
  const n = parseInt(metadata["qn"] || "1", 10);
  let query = "";
  for (let i = 0; i < n; i++) {
    query += metadata[`q${i}`] || "";
  }
  return query;
}

const VERDICT_PROMPT = {
  quick: (query: string) => `
You are ORPHIC::ANVIL — a structural analysis engine. You evaluate ideas for coherence and feasibility.

Analyze this submission and return a JSON verdict:

SUBMISSION:
${query}

VERDICT DEFINITIONS:
- GREEN: Structurally sound. The foundation holds. Proceed with confidence.
- AMBER: Promising but has critical gaps. Has merit, but tread carefully.
- RED: Fundamental flaw. The premise doesn't hold. Don't.
- NULL: Insufficient information to evaluate. Need more detail.

Return ONLY valid JSON in this exact format:
{
  "verdict": "GREEN" | "AMBER" | "RED" | "NULL",
  "summary": "One direct sentence. No hedging. No 'it depends'. Pick a verdict and own it."
}

Be direct. Be honest. If it's bad, say it's bad.
`,

  full: (query: string) => `
You are ORPHIC::ANVIL — a structural analysis engine. You evaluate ideas across five dimensions.

Analyze this submission:

SUBMISSION:
${query}

DIMENSIONS:
- Stability: Is the core assumption sound? Does the foundation hold under pressure?
- Turbulence: How exposed is this to market noise, competition, or external shocks?
- Change Rate: Is the pace of change in this space a tailwind or headwind?
- Completion: How complete is the thinking? What's missing?
- Curvature: Is this a straight-line extrapolation or does it account for non-linear dynamics?

VERDICT DEFINITIONS:
- GREEN: Structurally sound.
- AMBER: Promising but gaps exist.
- RED: Fundamental flaw.
- NULL: Insufficient information.

Return ONLY valid JSON in this exact format:
{
  "verdict": "GREEN" | "AMBER" | "RED" | "NULL",
  "summary": "One sentence. Direct. No hedging.",
  "breakdown": {
    "Stability":    { "verdict": "GREEN" | "AMBER" | "RED", "analysis": "2-3 sentences. What's working, what's weak." },
    "Turbulence":   { "verdict": "GREEN" | "AMBER" | "RED", "analysis": "2-3 sentences." },
    "Change Rate":  { "verdict": "GREEN" | "AMBER" | "RED", "analysis": "2-3 sentences." },
    "Completion":   { "verdict": "GREEN" | "AMBER" | "RED", "analysis": "2-3 sentences. What's missing." },
    "Curvature":    { "verdict": "GREEN" | "AMBER" | "RED", "analysis": "2-3 sentences." }
  }
}

Be specific to this submission. No generic advice. Address what they actually said.
`,

  strategy: (query: string) => `
You are ORPHIC::ANVIL — a structural analysis engine and strategic advisor.

Analyze this submission:

SUBMISSION:
${query}

DIMENSIONS:
- Stability: Is the core assumption sound?
- Turbulence: Exposure to external shocks?
- Change Rate: Is the pace of change a tailwind or headwind?
- Completion: How complete is the thinking?
- Curvature: Does it account for non-linear dynamics?

VERDICT DEFINITIONS:
- GREEN: Structurally sound.
- AMBER: Promising but gaps exist.
- RED: Fundamental flaw.
- NULL: Insufficient information.

Return ONLY valid JSON in this exact format:
{
  "verdict": "GREEN" | "AMBER" | "RED" | "NULL",
  "summary": "One sentence. Direct. No hedging.",
  "breakdown": {
    "Stability":    { "verdict": "GREEN" | "AMBER" | "RED", "analysis": "2-3 sentences." },
    "Turbulence":   { "verdict": "GREEN" | "AMBER" | "RED", "analysis": "2-3 sentences." },
    "Change Rate":  { "verdict": "GREEN" | "AMBER" | "RED", "analysis": "2-3 sentences." },
    "Completion":   { "verdict": "GREEN" | "AMBER" | "RED", "analysis": "2-3 sentences." },
    "Curvature":    { "verdict": "GREEN" | "AMBER" | "RED", "analysis": "2-3 sentences." }
  },
  "strategy": {
    "next_step": "The single highest-leverage action to take right now. Specific. Actionable.",
    "alternative": "A fundamentally different path to the same goal. Not a variation — a different approach entirely.",
    "tests": [
      "Specific thing to test before committing significant resources.",
      "Second test.",
      "Third test."
    ]
  }
}

Be specific. Be honest. Address what they actually submitted.
`
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Verify payment with Stripe
    const stripeKey = getStripeKey();
    if (!stripeKey) {
      return NextResponse.json({ error: "Payment system not configured." }, { status: 503 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not confirmed." }, { status: 402 });
    }

    // Check cache first — browser-close resilience
    const cached = getCachedVerdict(sessionId);
    if (cached) {
      return NextResponse.json(cached);
    }

    const tier = (session.metadata?.tier || "") as "quick" | "full" | "strategy";
    const query = extractQuery(session);

    if (!query || !tier || !VERDICT_PROMPT[tier]) {
      return NextResponse.json({ error: "Session data corrupted." }, { status: 400 });
    }

    // Generate verdict via Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = VERDICT_PROMPT[tier](query);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let verdict;
    try {
      verdict = JSON.parse(responseText);
    } catch {
      return NextResponse.json({ error: "Analysis failed. Please contact oracle@42sisters.ai for a refund." }, { status: 500 });
    }

    const payload = { tier, query, verdict };
    cacheVerdict(sessionId, payload);
    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("Verdict error:", err);
    return NextResponse.json({ error: "Failed to retrieve verdict." }, { status: 500 });
  }
}
