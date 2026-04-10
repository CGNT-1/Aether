import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

function getStripeKey(): string {
  // Try secure file first (local), fall back to env var (Northflank)
  try {
    const keyPath = path.join(process.env.HOME || "/home/nous", ".credentials", "stripe_secret.key");
    return fs.readFileSync(keyPath, "utf8").trim();
  } catch {
    return process.env.STRIPE_SECRET_KEY || "";
  }
}

const TIERS: Record<string, { name: string; amount: number; currency: string; description: string }> = {
  quick: {
    name: "Quick Take",
    amount: 100, // $1.00 CAD in cents
    currency: "cad",
    description: "One verdict (GREEN/AMBER/RED/NULL) + one sentence. Brutally honest."
  },
  full: {
    name: "Full Breakdown",
    amount: 500, // $5.00 CAD
    currency: "cad",
    description: "Main verdict + five sub-indicators: Stability, Turbulence, Change Rate, Completion, Curvature. A paragraph for each."
  },
  strategy: {
    name: "Strategy Session",
    amount: 2500, // $25.00 CAD
    currency: "cad",
    description: "Full Breakdown + recommended next step, alternative path, three things to test. Follow-up included."
  }
};

// Store query across multiple metadata keys to handle long queries (500 char limit per value)
function packQuery(query: string): Record<string, string> {
  const MAX_CHUNK = 490;
  const chunks: Record<string, string> = {};
  for (let i = 0; i < Math.ceil(query.length / MAX_CHUNK); i++) {
    chunks[`q${i}`] = query.slice(i * MAX_CHUNK, (i + 1) * MAX_CHUNK);
  }
  chunks["qn"] = String(Math.ceil(query.length / MAX_CHUNK));
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const { tier, query, referral_code } = await req.json();

    if (!tier || !TIERS[tier]) {
      return NextResponse.json({ error: "Invalid tier. Use: quick, full, strategy" }, { status: 400 });
    }

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "A question or idea is required." }, { status: 400 });
    }

    const stripeKey = getStripeKey();
    if (!stripeKey) {
      return NextResponse.json({ error: "Payment system not configured." }, { status: 503 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });
    const t = TIERS[tier];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://42sisters.ai";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: t.currency,
          product_data: {
            name: `Oracle — ${t.name}`,
            description: t.description,
          },
          unit_amount: t.amount,
        },
        quantity: 1,
      }],
      mode: "payment",
      metadata: {
        tier,
        ...(referral_code && typeof referral_code === "string" ? { referral_code } : {}),
        ...packQuery(query.trim()),
      },
      success_url: `${siteUrl}/oracle/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#oracle`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
