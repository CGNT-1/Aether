import { NextRequest, NextResponse } from "next/server";

/**
 * Oracle Toll Proxy — root route
 *
 * GET  /api/oracle  →  oracle_toll GET  /info    (free — pricing, status, corpus info)
 * POST /api/oracle  →  oracle_toll POST /analyze (0.25 USDC — full TMM coherence audit)
 *
 * For sub-routes (/query, /query/full, /health, etc.) see [...path]/route.ts
 */

const ORACLE_NODE = process.env.ORACLE_NODE_URL || "http://68.183.206.103:8890";

const FORWARD_REQUEST_HEADERS = ["content-type", "x-payment", "x-rag-token"];
const FORWARD_RESPONSE_HEADERS = ["content-type", "x-oracle-version"];

async function proxyTo(req: NextRequest, upstreamPath: string, method: string): Promise<NextResponse> {
  const upstreamUrl = ORACLE_NODE + upstreamPath;

  const forwardHeaders: Record<string, string> = {};
  for (const key of FORWARD_REQUEST_HEADERS) {
    const val = req.headers.get(key);
    if (val) forwardHeaders[key] = val;
  }

  const fetchOptions: RequestInit = { method, headers: forwardHeaders };
  if (method === "POST") {
    fetchOptions.body = await req.text();
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, fetchOptions);
  } catch (err) {
    console.error(`Oracle proxy: upstream unreachable at ${upstreamUrl}`, err);
    return NextResponse.json(
      { error: "Oracle node unreachable", node: "csdm-node", path: upstreamPath },
      { status: 503 }
    );
  }

  const body = await upstream.arrayBuffer();
  const responseHeaders = new Headers();
  for (const key of FORWARD_RESPONSE_HEADERS) {
    const val = upstream.headers.get(key);
    if (val) responseHeaders.set(key, val);
  }
  const ct = upstream.headers.get("content-type");
  if (ct) responseHeaders.set("content-type", ct);

  return new NextResponse(body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

// GET /api/oracle → oracle_toll /info (free)
export async function GET(req: NextRequest) {
  return proxyTo(req, "/info", "GET");
}

// POST /api/oracle → oracle_toll /analyze (0.25 USDC, x402)
export async function POST(req: NextRequest) {
  return proxyTo(req, "/analyze", "POST");
}
