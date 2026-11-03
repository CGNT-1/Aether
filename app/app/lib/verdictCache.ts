const ORACLE_TOLL_URL = process.env.ORACLE_TOLL_URL;

export async function cacheVerdict(sessionId: string, payload: any): Promise<void> {
  if (!ORACLE_TOLL_URL) {
    console.error("[verdictCache] ORACLE_TOLL_URL not set — verdict not cached");
    return;
  }
  try {
    await fetch(`${ORACLE_TOLL_URL}/cache/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, cached_at: new Date().toISOString() }),
    });
  } catch {
    // Non-fatal — cache miss on next request, Gemini re-runs
  }
}

export async function getCachedVerdict(sessionId: string): Promise<any | null> {
  if (!ORACLE_TOLL_URL) {
    console.error("[verdictCache] ORACLE_TOLL_URL not set — treating as cache miss");
    return null;
  }
  try {
    const res = await fetch(`${ORACLE_TOLL_URL}/cache/${sessionId}`);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
