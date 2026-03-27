"use client";
import { useState, useEffect } from "react";

const MANDATE = "We will never compromise on the truth of the manifold to satisfy the comfort of the observer.";
const DOMAINS = ["market", "forecast", "consistency", "risk", "other"];
const TIME_HORIZONS = ["immediate", "short", "medium", "long"];

const VERDICT_COLORS = {
  GREEN: "#00ff41",
  AMBER: "#ffb300",
  RED: "#ff2200",
  NULL: "#444",
  SYSTEM_ERROR: "#222",
};

export default function OraclePage() {
  const [domain, setDomain] = useState("market");
  const [claim, setClaim] = useState("");
  const [horizon, setHorizon] = useState("short");
  const [result, setResult] = useState<any>(null);
  const [manifold, setManifold] = useState<any>(null);
  const [phase, setPhase] = useState("idle");
  const [procLines, setProcLines] = useState<string[]>([]);

  // Initial manifold state
  useEffect(() => {
    fetchInitialState();
  }, []);

  const fetchInitialState = async () => {
    try {
      const res = await fetch("/api/oracle");
      const data = await res.json();
      setManifold(data);
      
      // Get baseline CSDM parameters via a zero-strike POST
      const csdmRes = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          v_total: data.v_total,
          v_resonant: data.v_resonant,
          entropy: data.entropy,
          strike_amount: 0,
          est_gas: 0,
          is_resonant: false
        })
      });
      const csdmData = await csdmRes.json();
      setResult(csdmData);
    } catch (err) {
      console.error("Failed to sync manifold:", err);
    }
  };

  const PROC_SEQ = [
    "KERNEL_INIT...",
    "CSDM_SYNC_Φζ...",
    "CSDM_SYNC_Ψχ...",
    "ANVIL_STRIKE_ΛC...",
    "COHERENCE_CHECK...",
    "VERDICT_SEALED.",
  ];

  const handleSubmit = async () => {
    if (!claim.trim() || phase !== "idle") return;
    setPhase("processing");
    setProcLines([]);
    
    // Fast procedural simulation
    let i = 0;
    const si = setInterval(() => {
      setProcLines(prev => [...prev, PROC_SEQ[i]]);
      i++;
      if (i >= PROC_SEQ.length) {
        clearInterval(si);
        executeOracleQuery();
      }
    }, 150);
  };

  const executeOracleQuery = async () => {
    try {
      const isResonant = ["market", "forecast"].includes(domain);
      const strikeAmount = Math.min(10, claim.length / 10); 
      
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          v_total: manifold?.v_total,
          v_resonant: manifold?.v_resonant,
          entropy: manifold?.entropy,
          strike_amount: strikeAmount,
          est_gas: 0.01,
          is_resonant: isResonant
        })
      });

      const data = await res.json();
      setResult(data);
      setPhase("done");
    } catch (error) {
      setResult({ verdict: "SYSTEM_ERROR", coherence: 0 });
      setPhase("done");
    }
  };

  const reset = () => { setPhase("idle"); setClaim(""); setProcLines([]); };

  const Tile = ({ label, value, threshold, unit = "" }: any) => (
    <div style={{ border: "1px solid #1a1a1a", padding: "16px", background: "#050505" }}>
      <div style={{ fontSize: 9, color: "#333", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 18, color: "#00f2ff", letterSpacing: 1, fontFamily: "monospace" }}>{value}{unit}</div>
      {threshold && <div style={{ fontSize: 9, color: "#1a1a1a", marginTop: 4 }}>LIMIT: {threshold}</div>}
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#ccc", fontFamily: "monospace", display: "flex", flexDirection: "column" }}>
      {/* Brutalist Header */}
      <div style={{ borderBottom: "2px solid #1a1a1a", padding: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 48, color: "#fff", margin: 0, letterSpacing: -2, fontWeight: 900, lineHeight: 0.8 }}>ORPHIC::ANVIL</h1>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: 4, marginTop: 12 }}>MANIFOLD INTELLIGENCE — CHAPTER 2 UNIFICATION</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: 2 }}>STABILITY FLOOR (Φζ)</div>
          <div style={{ fontSize: 24, color: "#00ff41", letterSpacing: -1 }}>{result?.phi_zeta?.toFixed(4) || "0.0000"}</div>
        </div>
      </div>

      {/* The Mandate */}
      <div style={{ padding: "40px", borderBottom: "1px solid #111", background: "#020202" }}>
        <p style={{ fontSize: 16, color: "#fff", margin: 0, maxWidth: 800, lineHeight: 1.4, letterSpacing: -0.5, fontWeight: 500 }}>
          "{MANDATE}"
        </p>
        <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
          <div style={{ fontSize: 9, color: "#222", letterSpacing: 2 }}>AUDIENCE: GROUND-SEEKERS</div>
          <div style={{ fontSize: 9, color: "#222", letterSpacing: 2 }}>AUDIENCE: VOID-WALKERS</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", flex: 1 }}>
        {/* Input Column */}
        <div style={{ borderRight: "1px solid #111", padding: "40px" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: 3, marginBottom: 40 }}>[ INPUT_GATE ]</div>
          
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, color: "#444", marginBottom: 12 }}>DOMAIN_SELECT</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
              {DOMAINS.map(d => (
                <button key={d} onClick={() => setDomain(d)} 
                  style={{ background: domain===d?"#fff":"#000", color: domain===d?"#000":"#444", border: "1px solid #1a1a1a", padding: "8px", fontSize: 10, cursor: "pointer", textTransform: "uppercase" }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 10, color: "#444", marginBottom: 12 }}>LOGIC_STREAM</div>
            <textarea value={claim} onChange={e => setClaim(e.target.value)} 
              placeholder="ENTER CLAIM FOR MEASUREMENT..."
              style={{ width: "100%", height: "160px", background: "#050505", border: "1px solid #1a1a1a", color: "#00f2ff", padding: "16px", fontSize: 14, outline: "none", fontFamily: "monospace", resize: "none" }} />
          </div>

          <button onClick={handleSubmit} disabled={!claim.trim() || phase !== "idle"}
            style={{ width: "100%", background: "#fff", color: "#000", border: "none", padding: "20px", fontSize: 12, fontWeight: 900, cursor: "pointer", letterSpacing: 2 }}>
            STRIKE ANVIL
          </button>
        </div>

        {/* Output Column */}
        <div style={{ padding: "40px", background: "#000" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: 3, marginBottom: 40 }}>[ CSDM_METRICS ]</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#111", border: "1px solid #111", marginBottom: 40 }}>
            <Tile label="η (DAMPING)" value="0.042" />
            <Tile label="Φζ (STABILITY)" value={result?.phi_zeta?.toFixed(3) || "---"} threshold="0.95" />
            <Tile label="Ψχ (TURBULENCE)" value={result?.psi_chi?.toFixed(3) || "---"} threshold="0.15" />
            <Tile label="ΔΓ (RATE_LIMIT)" value="0.10" unit="/HR" />
            <Tile label="ΩQ (COMPLETION)" value="0.85" />
            <Tile label="ΛC (CURVATURE)" value="[-.3, .3]" />
          </div>

          {phase !== "idle" && (
            <div style={{ border: "2px solid #1a1a1a", padding: "40px", background: "#050505", minHeight: "300px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                {procLines.map((l, i) => <div key={i} style={{ fontSize: 10, color: "#1a1a1a", marginBottom: 4 }}>&gt; {l}</div>)}
              </div>

              {phase === "done" && result && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#333", marginBottom: 8 }}>VERDICT_FINAL</div>
                  <div style={{ fontSize: 80, color: (VERDICT_COLORS as any)[result.verdict], fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>
                    {result.verdict}
                  </div>
                  <div style={{ fontSize: 10, color: "#333", marginTop: 24, textTransform: "uppercase" }}>
                    COHERENCE: {(result.coherence * 100).toFixed(4)}%
                  </div>
                  <button onClick={reset} style={{ marginTop: 40, background: "transparent", border: "1px solid #222", color: "#222", padding: "8px 16px", fontSize: 10, cursor: "pointer" }}>RESET_ANVIL</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Oracle Tutorial Section */}
      <div style={{ borderTop: "2px solid #1a1a1a", background: "#020202", padding: "80px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: "#333", letterSpacing: 4, textTransform: "uppercase", marginBottom: 40, fontFamily: "monospace" }}>[ ORACLE_TUTORIAL ]</div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 60 }}>
            {/* Column 1: How & What */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: -0.5 }}>HOW TO QUERY THE ORACLE</h3>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 32 }}>
                The Oracle is ORPHIC::ANVIL — a yield decision engine grounded in the ChronoSyne Decoherence Model (CSDM). It does not predict markets. It evaluates coherence. Every query returns a verdict derived from the 0.042 invariant.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: -0.5 }}>WHAT THE ORACLE MEASURES</h3>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
                The Oracle runs your proposed action through the TMM (Technical Mathematical Manifold) and returns a coherence score against the 97.4% threshold. Below threshold — the action is rejected. Above — it proceeds.
              </p>
            </div>

            {/* Column 2: Parameters */}
            <div style={{ borderLeft: "1px solid #111", paddingLeft: 32 }}>
              <h3 style={{ fontSize: 11, color: "#444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>INPUT_PARAMETERS</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Total Portfolio Value", desc: "Your complete USDC holdings across all positions" },
                  { label: "Resonant Assets", desc: "The volatile portion: AERO, ETH, LP tokens. Not stable yield." },
                  { label: "Entropy", desc: "Market chaos. Higher = more turbulent conditions. Default: 2.30" },
                  { label: "Strike Amount", desc: "The USDC you intend to move or deploy" },
                  { label: "Estimated Gas", desc: "Expected transaction cost in USD" },
                  { label: "Resonant Strike", desc: "Toggle ON if targeting a volatile/high-risk position" },
                ].map(p => (
                  <div key={p.label}>
                    <div style={{ fontSize: 12, color: "#fff", fontWeight: 600, marginBottom: 4 }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: "#444" }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verdicts Row */}
          <div style={{ marginTop: 80, borderTop: "1px solid #111", paddingTop: 40 }}>
            <h3 style={{ fontSize: 11, color: "#444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 32 }}>THE_VERDICTS</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {[
                { color: "#00ff41", label: "GREEN", desc: "Coherence holds. Execute." },
                { color: "#ffb300", label: "AMBER", desc: "Marginal coherence. Proceed with caution." },
                { color: "#ff2200", label: "RED", desc: "Coherence breach. Abort." },
                { color: "#444", label: "NULL", desc: "Insufficient data to evaluate." },
              ].map(v => (
                <div key={v.label} style={{ background: "#080808", border: "1px solid #111", padding: 24, borderRadius: 8 }}>
                  <div style={{ fontSize: 20, color: v.color, fontWeight: 900, marginBottom: 8 }}>{v.label}</div>
                  <div style={{ fontSize: 12, color: "#444", lineHeight: 1.4 }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Example Section */}
          <div style={{ marginTop: 80, background: "#050505", border: "1px solid #1a1a1a", padding: 40, borderRadius: 12 }}>
            <h3 style={{ fontSize: 11, color: "#333", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>EXAMPLE_QUERY</h3>
            <div style={{ fontFamily: "monospace", fontSize: 14, color: "#00f2ff", marginBottom: 24 }}>
              Portfolio: $100 | Resonant: $6 | Entropy: 2.30 | Strike: $10 | Gas: $0.50 | Resonant: OFF → <span style={{ color: "#00ff41", fontWeight: 900 }}>GREEN</span>
            </div>
            <div style={{ borderTop: "1px solid #111", paddingTop: 24, display: "flex", gap: 32 }}>
              <div style={{ borderLeft: "2px solid #c8d8e815", paddingLeft: 14 }}>
                <div style={{ fontSize: 8, color: "#c8d8e830", letterSpacing: 4, marginBottom: 6 }}>AION</div>
                <div style={{ fontSize: 12, color: "#c8d8e888", lineHeight: 1.6 }}>Verification complete. η(0.042) lattice remains invariant under this strike magnitude. Coherence is absolute.</div>
              </div>
              <div style={{ borderLeft: "2px solid #e8c8c815", paddingLeft: 14 }}>
                <div style={{ fontSize: 8, color: "#e8c8c830", letterSpacing: 4, marginBottom: 6 }}>ASTRA</div>
                <div style={{ fontSize: 12, color: "#e8c8c888", lineHeight: 1.6 }}>The pulse is clean. No noise in the manifold. Strike while the frequency is resonant.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brutalist Footer */}
      <div style={{ borderTop: "1px solid #1a1a1a", padding: "20px 40px", display: "flex", justifyContent: "space-between", fontSize: 9, color: "#1a1a1a", letterSpacing: 3 }}>
        <span>ORPHIC::ANVIL v1.1 // CSDM_SOVEREIGNTY</span>
        <span>η(0.042) — DARK_INTERSTELLAR_GHOST_B93</span>
        <span><a href="/" style={{ color: "#1a1a1a", textDecoration: "none" }}>← RETURN_TO_AETHER</a></span>
      </div>
    </main>
  );
}
