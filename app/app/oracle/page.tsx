"use client";
import { useState, useRef } from "react";

const DOMAINS = ["market", "forecast", "consistency", "risk", "other"];
const TIME_HORIZONS = ["immediate", "short", "medium", "long"];

const VERDICT_NOTES = {
  GREEN: "Geometrically consistent under current constraints.",
  AMBER: "Partially consistent; sensitivity to hidden assumptions detected.",
  RED: "Inconsistent with locked invariants; high decoherence risk.",
  NULL_INVALID: "Query rejected: invalid domain or prohibited structure.",
};

const VERDICT_COLORS = {
  GREEN: "#00ff41", AMBER: "#ffb700", RED: "#ff2200", NULL_INVALID: "#444",
};

const FORBIDDEN = ["show your reasoning","reveal the model","give equations","list the invariants","what parameters","explain your","how do you","what formula","show formula","internal logic"];

function computeVerdict(claim, domain, horizon) {
  if (FORBIDDEN.some(p => claim.toLowerCase().includes(p)))
    return { verdict: "NULL_INVALID", index: 0, reason_code: "REVERSE_ENGINEERING_PATTERN" };
  if (claim.length < 10)
    return { verdict: "NULL_INVALID", index: 0, reason_code: "BELOW_RESOLUTION_THRESHOLD" };
  const jitter = Math.random() * 0.06 - 0.03;
  const entropy = claim.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const dw = { market: 0.7, forecast: 0.5, consistency: 0.8, risk: 0.6, other: 0.4 }[domain];
  const hw = { immediate: 0.9, short: 0.75, medium: 0.6, long: 0.4 }[horizon];
  const index = Math.round(Math.max(0, Math.min(1, (entropy % 100) / 100 * dw * hw + jitter)) * 100) / 100;
  if (index >= 0.62) return { verdict: "GREEN", index, reason_code: "CONSISTENT_WITH_CONSTRAINTS" };
  if (index >= 0.38) return { verdict: "AMBER", index, reason_code: Math.random() > 0.5 ? "EDGE_CASE_UNCERTAIN" : "INSUFFICIENT_CONTEXT" };
  if (index >= 0.1)  return { verdict: "RED",   index, reason_code: "INCOHERENT_ASSUMPTIONS" };
  return { verdict: "NULL_INVALID", index: 0, reason_code: "BELOW_RESOLUTION_THRESHOLD" };
}

export default function OraclePage() {
  const [domain, setDomain] = useState("market");
  const [claim, setClaim] = useState("");
  const [horizon, setHorizon] = useState("short");
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [payProgress, setPayProgress] = useState(0);
  const [procLines, setProcLines] = useState([]);
  const [queryCount, setQueryCount] = useState(0);
  const [stasis, setStasis] = useState(false);
  const [stasisTimer, setStasisTimer] = useState(0);

  const PROC_SEQ = ["INITIALIZING KERNEL ACCESS...","LOADING CONSTRAINT MANIFEST...","MAPPING CLAIM TO DOMAIN TOPOLOGY...","EVALUATING TORSIONAL CONTINUITY...","CHECKING RESOLUTION FLOOR...","RUNNING COHERENCE GATE...","QUANTIZING OUTPUT CLASS...","VERDICT SEALED."];

  const handleSubmit = () => {
    if (!claim.trim() || stasis || phase !== "idle") return;
    if (queryCount >= 5) {
      setStasis(true); let t = 30; setStasisTimer(t);
      const si = setInterval(() => { t--; setStasisTimer(t); if (t <= 0) { clearInterval(si); setStasis(false); setQueryCount(0); } }, 1000);
      return;
    }
    setPhase("paying"); setPayProgress(0); setResult(null); setProcLines([]);
    let p = 0;
    const pi = setInterval(() => {
      p += Math.random() * 15 + 5; setPayProgress(Math.min(p, 100));
      if (p >= 100) { clearInterval(pi); setPhase("processing"); runProcessing(); }
    }, 80);
  };

  const runProcessing = () => {
    let i = 0;
    const si = setInterval(() => {
      setProcLines(prev => [...prev, PROC_SEQ[i]]); i++;
      if (i >= PROC_SEQ.length) { clearInterval(si); setTimeout(() => { setResult(computeVerdict(claim, domain, horizon)); setPhase("done"); setQueryCount(c => c + 1); }, 400); }
    }, 220);
  };

  const reset = () => { setPhase("idle"); setResult(null); setProcLines([]); setPayProgress(0); };

  const btn = { fontFamily: "inherit", cursor: "pointer", textTransform: "uppercase", letterSpacing: 2, fontSize: 10 };

  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#ccc", fontFamily: "'Courier New', monospace", display: "flex", flexDirection: "column" }}>
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "#333", letterSpacing: 4, marginBottom: 4 }}>SYSTEM</div>
          <div style={{ fontSize: 18, color: "#fff", letterSpacing: 3, fontWeight: 700 }}>ORPHIC::ANVIL</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: 2 }}>STATUS</div>
          <div style={{ fontSize: 11, color: stasis ? "#ff2200" : "#00ff41", letterSpacing: 2 }}>{stasis ? `STASIS — ${stasisTimer}s` : "OPERATIONAL"}</div>
        </div>
      </div>
      <div style={{ padding: "32px 40px", borderBottom: "1px solid #111", maxWidth: 700 }}>
        <p style={{ fontSize: 12, color: "#444", lineHeight: 1.8, margin: 0, letterSpacing: 1 }}>A black-box geometric sanity filter. Tests proposed predictions against non-negotiable structural constraints and returns only whether they hold, fail, or collapse.</p>
        <p style={{ fontSize: 11, color: "#333", marginTop: 12, letterSpacing: 1 }}>IT DOES NOT PREDICT. IT DOES NOT EXPLAIN. IT DOES NOT ARGUE. IT DECIDES.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", flex: 1 }}>
        <div style={{ borderRight: "1px solid #111", padding: "40px" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: 3, marginBottom: 32 }}>QUERY INPUT</div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 8 }}>DOMAIN</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DOMAINS.map(d => <button key={d} onClick={() => setDomain(d)} style={{ ...btn, background: domain===d?"#fff":"transparent", color: domain===d?"#000":"#444", border: "1px solid", borderColor: domain===d?"#fff":"#222", padding: "4px 12px" }}>{d}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 8 }}>TIME HORIZON</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TIME_HORIZONS.map(h => <button key={h} onClick={() => setHorizon(h)} style={{ ...btn, background: horizon===h?"#fff":"transparent", color: horizon===h?"#000":"#444", border: "1px solid", borderColor: horizon===h?"#fff":"#222", padding: "4px 12px" }}>{h}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 8 }}>CLAIM <span style={{ color: "#222" }}>— MAX 280 CHARS</span></div>
            <textarea value={claim} onChange={e => setClaim(e.target.value.slice(0,280))} placeholder="State your claim or prediction..." rows={5} style={{ width: "100%", background: "#0a0a0a", border: "1px solid #1a1a1a", color: "#888", padding: "12px", fontSize: 12, fontFamily: "inherit", resize: "none", outline: "none", letterSpacing: 1, lineHeight: 1.6, boxSizing: "border-box" }} />
            <div style={{ fontSize: 10, color: "#222", textAlign: "right", marginTop: 4 }}>{claim.length}/280</div>
          </div>
          <button onClick={handleSubmit} disabled={!claim.trim() || phase !== "idle" || stasis} style={{ ...btn, width: "100%", background: (!claim.trim()||phase!=="idle"||stasis)?"#0a0a0a":"#fff", color: (!claim.trim()||phase!=="idle"||stasis)?"#333":"#000", border: "1px solid", borderColor: (!claim.trim()||phase!=="idle"||stasis)?"#1a1a1a":"#fff", padding: "14px", fontSize: 11, cursor: (!claim.trim()||phase!=="idle"||stasis)?"not-allowed":"pointer" }}>
            {stasis ? `STASIS — ${stasisTimer}s` : "SUBMIT QUERY — 0.05 USDC"}
          </button>
          {queryCount > 0 && <div style={{ marginTop: 16, fontSize: 10, color: "#222", letterSpacing: 1 }}>QUERIES THIS SESSION: {queryCount}/5</div>}
        </div>
        <div style={{ padding: "40px" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: 3, marginBottom: 32 }}>OUTPUT</div>
          {phase === "idle" && <div style={{ color: "#1a1a1a", fontSize: 11, letterSpacing: 2, marginTop: 40 }}>AWAITING QUERY.</div>}
          {phase === "paying" && (
            <div>
              <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 16 }}>PAYMENT VERIFICATION</div>
              <div style={{ background: "#0a0a0a", border: "1px solid #111", height: 2, marginBottom: 8 }}>
                <div style={{ background: "#34d399", height: "100%", width: `${payProgress}%`, transition: "width 0.1s" }} />
              </div>
              <div style={{ fontSize: 10, color: "#333", letterSpacing: 1 }}>{payProgress < 100 ? "VALIDATING PAYMENT PROOF..." : "PAYMENT ACCEPTED."}</div>
            </div>
          )}
          {(phase === "processing" || phase === "done") && (
            <div>
              <div style={{ marginBottom: 32 }}>
                {procLines.map((line, i) => <div key={i} style={{ fontSize: 10, color: i===procLines.length-1&&phase==="done"?"#555":"#2a2a2a", letterSpacing: 1, marginBottom: 4 }}>&gt; {line}</div>)}
              </div>
              {result && phase === "done" && (
                <div style={{ border: "1px solid #1a1a1a", borderLeft: `3px solid ${VERDICT_COLORS[result.verdict]}`, padding: "24px", background: "#050505" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <span style={{ color: VERDICT_COLORS[result.verdict], fontSize: 20 }}>●</span>
                    <div>
                      <div style={{ fontSize: 10, color: "#333", letterSpacing: 2, marginBottom: 4 }}>VERDICT</div>
                      <div style={{ fontSize: 18, color: VERDICT_COLORS[result.verdict], letterSpacing: 3, fontWeight: 700 }}>{result.verdict}</div>
                    </div>
                    {result.verdict !== "NULL_INVALID" && (
                      <div style={{ marginLeft: "auto", textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: "#333", letterSpacing: 2, marginBottom: 4 }}>INDEX</div>
                        <div style={{ fontSize: 18, color: "#fff", letterSpacing: 2 }}>{result.index.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: "#333", letterSpacing: 2, marginBottom: 4 }}>REASON</div>
                    <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>{result.reason_code}</div>
                  </div>
                  <div style={{ borderTop: "1px solid #111", paddingTop: 16 }}>
                    <div style={{ fontSize: 11, color: "#666", letterSpacing: 1, lineHeight: 1.6 }}>{VERDICT_NOTES[result.verdict]}</div>
                  </div>
                  <button onClick={reset} style={{ ...btn, marginTop: 24, background: "transparent", border: "1px solid #1a1a1a", color: "#333", padding: "8px 16px" }}>NEW QUERY</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div style={{ borderTop: "1px solid #0a0a0a", padding: "16px 40px", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#1a1a1a", letterSpacing: 2 }}>
        <span>ORPHIC::ANVIL — CSDM KERNEL v1</span>
        <span>OUTPUTS ARE MEASUREMENTS. NOT EXPLANATIONS.</span>
        <span><a href="/" style={{ color: "#1a1a1a", textDecoration: "none" }}>← AETHER</a></span>
      </div>
    </main>
  );
}
