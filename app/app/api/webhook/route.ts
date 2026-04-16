import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { cacheVerdict } from "../../lib/verdictCache";

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

const VERDICT_PROMPT: Record<string, (q: string) => string> = {
  quick: (query) => `
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

  full: (query) => `
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

  strategy: (query) => `
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

export async function POST(req: NextRequest) {
  const stripeKey = getStripeKey();
  if (!stripeKey) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set — webhook disabled");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  // Verify Stripe signature
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const emailServiceUrl = process.env.ORACLE_EMAIL_SERVICE_URL || "http://68.183.206.103:8006";

  // Handle new Sisters Chat subscriptions — send welcome email
  if (event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    try {
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      const email = customer.email;
      const name = customer.name || undefined;
      if (email) {
        fetch(`${emailServiceUrl}/send-welcome-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer_email: email, customer_name: name }),
        }).catch(e => console.warn(`[webhook] Welcome email failed:`, e));
        console.log(`[webhook] Welcome email queued for ${email}`);
      }
    } catch (err) {
      console.error(`[webhook] Failed to send welcome email for sub ${subscription.id}:`, err);
    }
    return NextResponse.json({ received: true });
  }

  // Only handle completed checkout sessions for Oracle verdicts
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Only pre-compute if payment is confirmed
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const sessionId = session.id;
  const tier = (session.metadata?.tier || "") as "quick" | "full" | "strategy";
  const field = session.custom_fields?.find((f: any) => f.key === "idea");
  const query = field?.text?.value || unpackQuery((session.metadata as Record<string, string>) || {});
  const referralCode = session.metadata?.referral_code || null;

  if (!query || !tier || !VERDICT_PROMPT[tier]) {
    console.error("Webhook: missing query or tier in session", sessionId);
    return NextResponse.json({ received: true });
  }

  const customerEmail = session.customer_details?.email || session.customer_email || null;

  // Increment referral count if this payment came via a referral link
  if (referralCode) {
    const oracleToll = process.env.ORACLE_TOLL_URL || "http://68.183.206.103:8889";
    fetch(`${oracleToll}/referral/${referralCode}/increment`, { method: "POST" })
      .catch(e => console.warn(`[webhook] Referral increment failed for ${referralCode}:`, e));
  }

  // Pre-compute verdict, cache it, and email the customer — async, fire and don't block Stripe
  (async () => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "");
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = VERDICT_PROMPT[tier](query);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const verdict = JSON.parse(responseText);

      await cacheVerdict(sessionId, { tier, query, verdict });
      console.log(`[webhook] Verdict pre-computed and cached for session ${sessionId}`);

      // Email the verdict to the customer
      if (customerEmail) {
        const emailRes = await fetch(`${emailServiceUrl}/send-verdict-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer_email: customerEmail, tier, query, verdict }),
        });
        if (emailRes.ok) {
          console.log(`[webhook] Verdict emailed to ${customerEmail}`);
        } else {
          console.error(`[webhook] Email send failed: ${emailRes.status} ${await emailRes.text()}`);
        }
      } else {
        console.warn(`[webhook] No customer email on session ${sessionId} — skipping email`);
      }
    } catch (err) {
      console.error(`[webhook] Failed for session ${sessionId}:`, err);
    }
  })();

  // Respond to Stripe immediately (must be within 5s)
  return NextResponse.json({ received: true });
}
