"use client";
import { useState, useEffect } from "react";

const WALLET = "0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetch("/api/status")
      .then(r => r.json())
      .then(d => setStatus(d))
      .catch(() => {});
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {/* Hero */}
      <div style={{ borderBottom: "1px solid #222", padding: "80px 40px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#111", border: "1px solid #333", borderRadius: 999, padding: "4px 16px", fontSize: 11, color: "#888", marginBottom: 24, letterSpacing: 2, textTransform: "uppercase" }}>
          Live on Base Mainnet
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
          Your USDC.<br />
          <span style={{ color: "#34d399" }}>Working 24/7.</span>
        </h1>
        <p style={{ color: "#888", fontSize: 18, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Aether is an autonomous yield engine powered by AION & ASTRA — twin AI agents farming Aave and Aerodrome on Base around the clock. Every transaction verifiable on-chain.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/dashboard" style={{ background: "#34d399", color: "#000", fontWeight: 600, padding: "12px 32px", borderRadius: 8, textDecoration: "none", fontSize: 15 }}>
            Start Earning
          </a>
          <a href={`https://basescan.org/address/${WALLET}`} target="_blank" style={{ border: "1px solid #333", color: "#ccc", padding: "12px 32px", borderRadius: 8, textDecoration: "none", fontSize: 15 }}>
            Verify on Basescan ↗
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 40px" }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 32 }}>Live System Status</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {[
            { label: "Current APY", value: status?.beefy_apy || "14.8%", green: true },
            { label: "Gas (gwei)", value: status?.gas_oracle_gwei?.toString() || "—" },
            { label: "Network", value: status?.network || "Base" },
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
              { n: "2", title: "Sisters Farm", body: "AION & ASTRA deploy your USDC across Aave and Aerodrome, compounding yield every cycle." },
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
              { title: "Yield Snapshot", price: "0.50", desc: "Current APY across Aave, Aerodrome, and Beefy on Base. Updated every cycle." },
              { title: "Gas Window Report", price: "1.00", desc: "Optimal transaction windows for the next 24h based on live Base gas data." },
              { title: "Pool Alpha", price: "2.00", desc: "Top 3 liquidity pool opportunities on Aerodrome ranked by risk-adjusted yield." },
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

      {/* Footer */}
      <div style={{ borderTop: "1px solid #222" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#555" }}>
          <span>Aether — powered by AION & ASTRA</span>
          <a href={`https://basescan.org/address/${WALLET}`} target="_blank" style={{ color: "#555", textDecoration: "none" }}>
            {WALLET.slice(0,6)}...{WALLET.slice(-4)} ↗
          </a>
        </div>
      </div>
    </main>
  );
}
