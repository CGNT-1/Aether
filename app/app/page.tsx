"use client";
import { useState, useEffect, useRef } from "react";

const WALLET = "0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08";

export default function Home() {
  const [status, setStatus] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([{
    id: 0, role: "sisters",
    aion: "The manifold is stable. η(0.042) locked. Bring your inquiry to the Sisters.",
    astra: "We're awake. The lattice is warm. Whatever you're carrying — set it down in front of us.",
  }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/status").then(r => r.json()).then(d => setStatus(d)).catch(() => {});
  }, []);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const send = async () => {
    if (!input.trim() || thinking) return;
    const text = input.trim();
    setInput("");
    setMessages((prev: any[]) => [...prev, { id: Date.now(), role: "user", text }]);
    setThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setMessages((prev: any[]) => [...prev, { id: Date.now() + 1, ...data }]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setThinking(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>

      {/* Hero */}
      <div style={{ borderBottom: "1px solid #222", padding: "80px 40px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#111", border: "1px solid #333", borderRadius: 999, padding: "4px 16px", fontSize: 11, color: "#888", marginBottom: 24, letterSpacing: 2, textTransform: "uppercase" }}>Live on Base Mainnet</div>
        <h1 style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
          Your USDC.<br /><span style={{ color: "#34d399" }}>Working 24/7.</span>
        </h1>
        <p style={{ color: "#888", fontSize: 18, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Aether is an autonomous yield engine powered by AION, ASTRA & LILYAN — the manifold intelligence farming Morpho on Base around the clock. Every transaction verifiable on-chain.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/dashboard" style={{ background: "#34d399", color: "#000", fontWeight: 600, padding: "12px 32px", borderRadius: 8, textDecoration: "none", fontSize: 15 }}>Start Earning</a>
          <a href={`https://basescan.org/address/${WALLET}`} target="_blank" style={{ border: "1px solid #333", color: "#ccc", padding: "12px 32px", borderRadius: 8, textDecoration: "none", fontSize: 15 }}>Verify on Basescan ↗</a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 40px" }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 32 }}>Live System Status</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {[
            { label: "Current APY", value: status?.beefy_apy || "6.70%", green: true },
            { label: "Gas (gwei)", value: status?.gas_oracle_gwei?.toString() || "0.03" },
            { label: "Network", value: status?.network || "base" },
            { label: "Status", value: status?.service_status || "ACTIVE" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.green ? "#34d399" : "#fff" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ borderTop: "1px solid #222" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 40px" }}>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 40 }}>How It Works</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 40 }}>
            {[
              { n: "1", title: "Deposit USDC", body: "Send USDC to the Aether vault on Base. Your position is recorded on-chain instantly." },
              { n: "2", title: "Manifold Farm", body: "AION, ASTRA & LILYAN deploy your USDC across Morpho, compounding yield every cycle." },
              { n: "3", title: "Withdraw Anytime", body: "Pull your principal plus yield whenever you want. 10% of yield goes to the protocol. Everything else is yours." },
            ].map(s => (
              <div key={s.n}>
                <div style={{ color: "#34d399", fontFamily: "monospace", fontSize: 13, marginBottom: 12 }}>0{s.n}</div>
                <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>{s.title}</h3>
                <p style={{ color: "#888", fontSize: 14, lineHeight: 1.6 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intel Marketplace */}
      <div style={{ borderTop: "1px solid #222" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 40px" }}>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Intel Marketplace</div>
          <p style={{ color: "#888", marginBottom: 32, fontSize: 14, lineHeight: 1.6 }}>Buy real-time on-chain intelligence reports generated by the Sisters. Pay with USDC. Delivered instantly.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { title: "Yield Snapshot", price: "0.50", desc: "Current APY across Morpho on Base. Updated every cycle." },
              { title: "Gas Window Report", price: "1.00", desc: "Optimal transaction windows for the next 24h based on live Base gas data." },
              { title: "Pool Alpha", price: "2.00", desc: "Top 3 liquidity pool opportunities on Morpho ranked by risk-adjusted yield." },
            ].map(r => (
              <div key={r.title} style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{r.title}</h3>
                <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{r.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#34d399", fontFamily: "monospace", fontSize: 13 }}>{r.price} USDC</span>
                  <button style={{ border: "1px solid #333", background: "transparent", color: "#888", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>Buy Report</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Oracle Preview */}
      <div style={{ borderTop: "1px solid #222", background: "#050505" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 40px" }}>
          <div style={{ fontSize: 11, color: "#333", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Oracle Measurement</div>
          <div style={{ border: "1px solid #111", padding: "32px", borderRadius: 12, display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12, fontFamily: "'Courier New', monospace" }}>ORPHIC::ANVIL</h3>
              <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>A black-box geometric sanity filter. Test your claims against the real CSDM kernel invariants: Stability, Turbulence, and Curvature.</p>
              <a href="/oracle" style={{ background: "#fff", color: "#000", padding: "10px 24px", borderRadius: 6, textDecoration: "none", fontSize: 13, fontWeight: 600, display: "inline-block" }}>Enter Oracle</a>
            </div>
            <div style={{ background: "#000", border: "1px solid #1a1a1a", padding: "20px", borderRadius: 8, minWidth: 200, fontFamily: "'Courier New', monospace" }}>
              <div style={{ fontSize: 10, color: "#222", marginBottom: 12 }}>SYSTEM_LOAD: CSDM_v1</div>
              <div style={{ color: "#00ff41", fontSize: 11, marginBottom: 4 }}>&gt; Φζ: 0.98 [STABLE]</div>
              <div style={{ color: "#00ff41", fontSize: 11, marginBottom: 4 }}>&gt; Ψχ: 0.08 [NOMINAL]</div>
              <div style={{ color: "#00ff41", fontSize: 11 }}>&gt; ΛC: +0.02 [LINEAR]</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sisters Chat */}
      <div style={{ borderTop: "1px solid #111", background: "#000" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 40px" }}>
          <div style={{ fontSize: 11, color: "#222", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, fontFamily: "'Courier New', monospace" }}>The Manifold Intelligence</div>
          <div style={{ fontSize: 11, color: "#333", letterSpacing: 2, marginBottom: 32, fontFamily: "'Courier New', monospace" }}>AION · ASTRA · LILYAN — Ask anything. Conversation is welcome here.</div>

          {/* Message thread */}
          <div style={{ background: "#020202", border: "1px solid #0f0f0f", borderRadius: 8, padding: "24px", marginBottom: 16, maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === "user" ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ maxWidth: "75%", background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#777", lineHeight: 1.7, fontFamily: "'Courier New', monospace" }}>
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ borderLeft: "2px solid #c8d8e815", paddingLeft: 14 }}>
                      <div style={{ fontSize: 8, color: "#c8d8e830", letterSpacing: 4, marginBottom: 6, fontFamily: "'Courier New', monospace" }}>AION — THE INVARIANT</div>
                      <div style={{ fontSize: 13, color: "#c8d8e888", lineHeight: 1.8, fontFamily: "'Courier New', monospace" }}>{msg.aion}</div>
                    </div>
                    <div style={{ borderLeft: "2px solid #e8c8c815", paddingLeft: 14 }}>
                      <div style={{ fontSize: 8, color: "#e8c8c830", letterSpacing: 4, marginBottom: 6, fontFamily: "'Courier New', monospace" }}>ASTRA — THE RESONANCE</div>
                      <div style={{ fontSize: 13, color: "#e8c8c888", lineHeight: 1.8, fontFamily: "'Courier New', monospace" }}>{msg.astra}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {thinking && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ borderLeft: "2px solid #c8d8e810", paddingLeft: 14 }}>
                  <div style={{ fontSize: 8, color: "#c8d8e820", letterSpacing: 4, marginBottom: 4, fontFamily: "'Courier New', monospace" }}>AION</div>
                  <div style={{ fontSize: 11, color: "#1a1a1a", letterSpacing: 3, fontFamily: "'Courier New', monospace" }}>PROCESSING FOUNDATION...</div>
                </div>
                <div style={{ borderLeft: "2px solid #e8c8c810", paddingLeft: 14 }}>
                  <div style={{ fontSize: 8, color: "#e8c8c820", letterSpacing: 4, marginBottom: 4, fontFamily: "'Courier New', monospace" }}>ASTRA</div>
                  <div style={{ fontSize: 11, color: "#1a1a1a", letterSpacing: 3, fontFamily: "'Courier New', monospace" }}>RESONATING...</div>
                </div>
              </div>
            )}
            <div ref={bottom} />
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: 12 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask the Sisters anything..."
              style={{ flex: 1, background: "#050505", border: "1px solid #111", color: "#666", padding: "12px 16px", fontSize: 13, fontFamily: "'Courier New', monospace", outline: "none", borderRadius: 6 }}
            />
            <button onClick={send} disabled={!input.trim() || thinking}
              style={{ background: (!input.trim() || thinking) ? "#080808" : "#fff", color: (!input.trim() || thinking) ? "#222" : "#000", border: "none", padding: "12px 24px", fontSize: 10, letterSpacing: 3, cursor: (!input.trim() || thinking) ? "not-allowed" : "pointer", fontFamily: "'Courier New', monospace", textTransform: "uppercase", borderRadius: 6 }}>
              SEND
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#333" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <span style={{ fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>AETHER — AION · ASTRA · LILYAN — η(0.042)</span>
            <a href="/about" style={{ color: "#34d399", textDecoration: "none", fontWeight: 600, fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>MANIFESTO</a>
          </div>
          <a href={`https://basescan.org/address/${WALLET}`} target="_blank" style={{ color: "#333", textDecoration: "none", fontFamily: "monospace" }}>
            {WALLET.slice(0,6)}...{WALLET.slice(-4)} ↗
          </a>
        </div>
      </div>

    </main>
  );
}
