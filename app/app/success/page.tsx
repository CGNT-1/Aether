"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const G   = "#34d399";
const BG  = "#000";
const S1  = "#111";
const BD  = "#1a1a1a";
const BD2 = "#222";
const TXT = "#aaa";
const DIM = "#555";

const VERDICT_COLORS: Record<string, string> = {
  GREEN: "#34d399",
  AMBER: "#f5c842",
  RED:   "#ff4444",
  NULL:  "#555",
};

const VERDICT_LABELS: Record<string, string> = {
  GREEN: "Strong. Proceed with confidence.",
  AMBER: "Shaky. Has gaps. Proceed with caution.",
  RED:   "Don't. The foundation doesn't hold.",
  NULL:  "We need more detail. Resubmit.",
};

function VerdictDot({ v, size = 14 }: { v: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: VERDICT_COLORS[v] || "#555",
      display: "inline-block", flexShrink: 0,
    }} />
  );
}

function SubIndicator({ name, verdict, analysis }: { name: string; verdict: string; analysis: string }) {
  return (
    <div style={{ background: S1, border: `1px solid ${BD2}`, borderRadius: 8, padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <VerdictDot v={verdict} size={10} />
        <div style={{ fontSize: 11, color: "#ccc", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Courier New', monospace" }}>{name}</div>
        <div style={{ fontSize: 11, color: VERDICT_COLORS[verdict] || "#555", marginLeft: "auto", fontFamily: "'Courier New', monospace", fontWeight: 700 }}>{verdict}</div>
      </div>
      <p style={{ color: TXT, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{analysis}</p>
    </div>
  );
}

function ResultsView() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) { setState("error"); setError("No session ID found."); return; }
    fetch(`/api/verdict?session_id=${sessionId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setState("error"); setError(d.error); }
        else { setData(d); setState("done"); }
      })
      .catch(() => { setState("error"); setError("Connection failed. Please contact oracle@42sisters.ai"); });
  }, [sessionId]);

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "system-ui, sans-serif", fontSize: 15 }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BD}`, padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 48, background: "rgba(0,0,0,0.94)", backdropFilter: "blur(10px)" }}>
        <a href="/" style={{ fontFamily: "'Courier New', monospace", fontSize: 12, letterSpacing: 2, color: DIM, textDecoration: "none" }}>AETHER</a>
        <a href="/#oracle" style={{ color: DIM, textDecoration: "none", fontSize: 12, fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>← Back to Oracle</a>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 40px" }}>

        {state === "loading" && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 11, color: DIM, letterSpacing: 3, textTransform: "uppercase", marginBottom: 24, fontFamily: "'Courier New', monospace" }}>ORPHIC::ANVIL</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Analyzing your submission...</h1>
            <p style={{ color: TXT, fontSize: 15, lineHeight: 1.6 }}>
              Payment confirmed. The engine is running your analysis. This takes 5–15 seconds.
            </p>
            <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 8 }}>
              {["■", "■", "■"].map((c, i) => (
                <div key={i} style={{ color: G, fontSize: 20, opacity: 0.3 + i * 0.3 }}>{c}</div>
              ))}
            </div>
          </div>
        )}

        {state === "error" && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 11, color: "#ff4444", letterSpacing: 3, textTransform: "uppercase", marginBottom: 24, fontFamily: "'Courier New', monospace" }}>ERROR</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Something went wrong.</h1>
            <p style={{ color: TXT, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>{error}</p>
            <a href="mailto:oracle@42sisters.ai" style={{ color: G, fontSize: 14 }}>oracle@42sisters.ai</a>
          </div>
        )}

        {state === "done" && data && (() => {
          const { tier, query, verdict } = data;
          const mainVerdict = verdict.verdict;
          const vColor = VERDICT_COLORS[mainVerdict] || "#555";

          return (
            <div>
              {/* Header */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 11, color: DIM, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16, fontFamily: "'Courier New', monospace" }}>
                  ORPHIC::ANVIL · {tier === "quick" ? "Quick Take" : tier === "full" ? "Full Breakdown" : "Strategy Session"}
                </div>

                {/* Main verdict */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: "50%",
                    background: vColor, flexShrink: 0,
                    boxShadow: `0 0 24px ${vColor}44`
                  }} />
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 700, color: vColor, lineHeight: 1, letterSpacing: -0.5 }}>{mainVerdict}</div>
                    <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>{VERDICT_LABELS[mainVerdict]}</div>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ background: S1, border: `1px solid ${BD2}`, borderLeft: `3px solid ${vColor}`, borderRadius: 8, padding: "18px 22px" }}>
                  <p style={{ color: "#ddd", fontSize: 17, lineHeight: 1.65, margin: 0 }}>{verdict.summary}</p>
                </div>
              </div>

              {/* Submitted query */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 10, color: DIM, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, fontFamily: "'Courier New', monospace" }}>Your Submission</div>
                <div style={{ background: "#050505", border: `1px solid ${BD}`, borderRadius: 6, padding: "14px 18px", color: "#777", fontSize: 13, lineHeight: 1.7, fontFamily: "'Courier New', monospace", whiteSpace: "pre-wrap" }}>
                  {query}
                </div>
              </div>

              {/* Full Breakdown */}
              {verdict.breakdown && (
                <div style={{ marginBottom: 40 }}>
                  <div style={{ fontSize: 10, color: DIM, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16, fontFamily: "'Courier New', monospace" }}>Five-Dimension Analysis</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Object.entries(verdict.breakdown).map(([name, item]: [string, any]) => (
                      <SubIndicator key={name} name={name} verdict={item.verdict} analysis={item.analysis} />
                    ))}
                  </div>
                </div>
              )}

              {/* Strategy */}
              {verdict.strategy && (
                <div style={{ marginBottom: 40 }}>
                  <div style={{ fontSize: 10, color: DIM, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16, fontFamily: "'Courier New', monospace" }}>Strategic Direction</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ background: S1, border: `1px solid ${BD2}`, borderLeft: `3px solid ${G}`, borderRadius: 8, padding: "20px 22px" }}>
                      <div style={{ fontSize: 10, color: G, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontFamily: "'Courier New', monospace" }}>Recommended Next Step</div>
                      <p style={{ color: TXT, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{verdict.strategy.next_step}</p>
                    </div>

                    <div style={{ background: S1, border: `1px solid ${BD2}`, borderLeft: `3px solid #888`, borderRadius: 8, padding: "20px 22px" }}>
                      <div style={{ fontSize: 10, color: "#888", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontFamily: "'Courier New', monospace" }}>Alternative Path</div>
                      <p style={{ color: TXT, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{verdict.strategy.alternative}</p>
                    </div>

                    <div style={{ background: S1, border: `1px solid ${BD2}`, borderRadius: 8, padding: "20px 22px" }}>
                      <div style={{ fontSize: 10, color: DIM, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, fontFamily: "'Courier New', monospace" }}>Three Things to Test First</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {verdict.strategy.tests.map((test: string, i: number) => (
                          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                            <div style={{ color: G, fontSize: 12, fontFamily: "'Courier New', monospace", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>0{i + 1}</div>
                            <div style={{ color: TXT, fontSize: 14, lineHeight: 1.6 }}>{test}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 24, borderTop: `1px solid ${BD}` }}>
                <a href="/#oracle" style={{ background: G, color: "#000", fontWeight: 600, padding: "11px 28px", borderRadius: 8, textDecoration: "none", fontSize: 14 }}>
                  Submit another →
                </a>
                <a href="mailto:oracle@42sisters.ai" style={{ border: `1px solid ${BD2}`, color: TXT, padding: "11px 28px", borderRadius: 8, textDecoration: "none", fontSize: 14 }}>
                  Questions? Email us
                </a>
              </div>
            </div>
          );
        })()}

      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "'Courier New', monospace", fontSize: 12, letterSpacing: 2 }}>
        LOADING...
      </div>
    }>
      <ResultsView />
    </Suspense>
  );
}
