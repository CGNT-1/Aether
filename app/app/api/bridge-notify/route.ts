import { NextResponse } from "next/server";
import { appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

// Bridge launch-notify signup (M041, 2026-10-17: hardened).
// Storage: one JSON line per address in a private 0600 file outside the app, used only
// to send the Bridge launch notice. No IP or other request data is stored.
const DIR = process.env.BRIDGE_NOTIFY_DIR || "/home/nous/private/bridge_notify";
const FILE = join(DIR, "emails.jsonl");
const PURPOSE = "bridge-launch-notify";

const MAX_BODY = 1024;              // bytes
const MAX_FILE = 5 * 1024 * 1024;   // stop accepting past 5 MB
const PER_IP = { limit: 5, windowMs: 60 * 60 * 1000 };
const GLOBAL = { limit: 200, windowMs: 60 * 60 * 1000 };
// Conservative address check: one @, no whitespace/control/quote/pipe characters, a dotted domain.
const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

// In-memory sliding windows (single Next.js process on OVH; resets on restart).
const hits = new Map<string, number[]>();
let globalHits: number[] = [];

function allow(key: string, now: number): boolean {
  globalHits = globalHits.filter((t) => now - t < GLOBAL.windowMs);
  if (globalHits.length >= GLOBAL.limit) return false;
  const list = (hits.get(key) || []).filter((t) => now - t < PER_IP.windowMs);
  if (list.length >= PER_IP.limit) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  globalHits.push(now);
  if (hits.size > 10000) hits.clear(); // bound memory under abuse
  return true;
}

function clientKey(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

function alreadyListed(email: string): boolean {
  if (!existsSync(FILE)) return false;
  return readFileSync(FILE, "utf8")
    .split("\n")
    .some((line) => {
      try {
        return line && JSON.parse(line).email === email;
      } catch {
        return false;
      }
    });
}

export async function POST(req: Request) {
  if (!allow(clientKey(req), Date.now())) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    if (!(req.headers.get("content-type") || "").includes("application/json")) {
      return NextResponse.json({ error: "Expected JSON" }, { status: 415 });
    }
    const raw = await req.text();
    if (raw.length > MAX_BODY) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const value = (body as { email?: unknown })?.email;
    const email = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    mkdirSync(DIR, { recursive: true, mode: 0o700 });
    if (existsSync(FILE) && statSync(FILE).size > MAX_FILE) {
      return NextResponse.json({ error: "List closed" }, { status: 503 });
    }
    if (!alreadyListed(email)) {
      const line = JSON.stringify({ ts: new Date().toISOString(), email, purpose: PURPOSE }) + "\n";
      appendFileSync(FILE, line, { encoding: "utf8", mode: 0o600 });
      chmodSync(FILE, 0o600);
    }
    // Same answer whether new or already listed: the endpoint does not reveal who signed up.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
