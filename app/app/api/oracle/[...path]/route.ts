import { NextRequest, NextResponse } from "next/server";

/**
 * Oracle Toll Proxy — catch-all route
 *
 * Maps:  /api/oracle/<anything>  →  csdm-node oracle_toll /<anything>
 *
 * Examples:
 *   GET  /api/oracle/health       → oracle_toll GET  /health        (free)
 *   GET  /api/oracle/info         → oracle_toll GET  /info          (free)
 *   POST /api/oracle/query        → oracle_toll POST /query         (0.05 USDC)
 *   POST /api/oracle/query/full   → oracle_toll POST /query/full    (0.25 USDC)
 *   POST /api/oracle/query/premium→ oracle_toll POST /query/premium (1.00 USDC)
 *   POST /api/oracle/analyze      → oracle_toll POST /analyze       (0.25 USDC)
 *
 * Payment flow (x402):
 *   1. Client POSTs → receives 402 + payment instructions in JSON body
 *   2. Client sends USDC on Base, gets tx hash
 *   3. Client retries with header: X-Payment: base64({"tx_hash":"0x..."})
 *   4. oracle_toll verifies on-chain → returns result
 *
 * The X-Payment header is forwarded transparently. This proxy adds no auth
 * of its own — access control lives in oracle_toll.
 */

const ORACLE_NODE = process.env.ORACLE_NODE_URL || "http://68.183.206.103";

// Headers to forward from the client to oracle_toll
const FORWARD_REQUEST_HEADERS = ["content-type", "x-payment", "x-rag-token"];

// Headers to forward from oracle_toll back to the client
const FORWARD_RESPONSE_HEADERS = ["content-type", "x-oracle-version"];

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, ctx: RouteContext, method: string): Promise<NextResponse> {
  const { path } = await ctx.params;
  const upstreamPath = "/" + path.join("/");
  const upstreamUrl = ORACLE_NODE + upstreamPath;

  // Forward safe request headers
  const forwardHeaders: Record<string, string> = {};
  for (const key of FORWARD_REQUEST_HEADERS) {
    const val = req.headers.get(key);
    if (val) forwardHeaders[key] = val;
  }

  const fetchOptions: RequestInit = { method, headers: forwardHeaders };
  if (method === "POST" || method === "PUT") {
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
  // Always set content-type if present
  const ct = upstream.headers.get("content-type");
  if (ct) responseHeaders.set("content-type", ct);

  return new NextResponse(body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx, "GET");
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx, "POST");
}
