import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiting (10 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count++;
  return false;
}

async function getManifoldState() {
  try {
    // Fallback to public status API to avoid local filesystem dependencies on Northflank
    const res = await fetch("https://raw.githubusercontent.com/CGNT-1/Aether/main/public/status.json", { next: { revalidate: 60 } });
    const status = await res.json();
    
    // Map status.json fields to TMM parameters
    return {
      v_total: status.total_value_cad || 120.04,
      v_resonant: (status.total_value_cad * 0.042) || 5.77, // Derived resonance
      entropy: status.gas_oracle_gwei || 2.30
    };
  } catch (error) {
    console.error("Error fetching manifold state:", error);
    return { v_total: 120.04, v_resonant: 5.04, entropy: 0.042 };
  }
}

export async function GET() {
  const state = await getManifoldState();
  return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Limit is 10 per minute." }, { status: 429 });
  }

  try {
    const body = await req.json();
    
    // Instead of local exec, we proxy to the public Oracle Toll /analyze endpoint
    // This is the "Shortcut" to stability on Northflank
    const ORACLE_TOLL_URL = "http://68.183.206.103:8890/analyze"; 
    
    const res = await fetch(ORACLE_TOLL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: body.text || "No data provided",
        context: "Web Interface Request"
      })
    });

    if (!res.ok) throw new Error("Oracle Toll unreachable");
    const result = await res.json();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Oracle API Proxy Error:", error);
    return NextResponse.json({ 
      error: "TMM Runtime Error", 
      message: "External processing error. Fallback active.",
      coherence: 0.042,
      approved: false,
      verdict: "DECOHERENT_SIGNAL"
    }, { status: 500 });
  }
}
