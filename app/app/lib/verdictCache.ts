import fs from "fs";
import path from "path";

const CACHE_PATH = path.join(process.env.HOME || "/home/nous", "oracle_verdict_cache.json");

function readCache(): Record<string, any> {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, any>): void {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch {
    // Non-fatal — cache miss on next request, Gemini re-runs
  }
}

export function cacheVerdict(sessionId: string, payload: any): void {
  const cache = readCache();
  cache[sessionId] = { ...payload, cached_at: new Date().toISOString() };
  writeCache(cache);
}

export function getCachedVerdict(sessionId: string): any | null {
  const cache = readCache();
  return cache[sessionId] || null;
}
