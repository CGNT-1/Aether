import React from "react";

export const metadata = {
  title: "About — 42Sisters.AI",
  description: "42 Sisters AI builds intelligence that measures coherence, not probability.",
};

const pageStyle: React.CSSProperties = { minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" };
const containerStyle: React.CSSProperties = { maxWidth: 900, margin: "0 auto", padding: "60px 40px" };
const headingStyle: React.CSSProperties = { fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: -1 };
const metaStyle: React.CSSProperties = { fontSize: 11, color: "#444", letterSpacing: 3, textTransform: "uppercase" as const, fontFamily: "'Courier New', monospace", marginBottom: 48, borderBottom: "1px solid #111", paddingBottom: 24 };
const sectionHeadStyle: React.CSSProperties = { fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase" as const, fontFamily: "'Courier New', monospace", marginBottom: 12, marginTop: 40 };
const bodyStyle: React.CSSProperties = { fontSize: 14, color: "#aaa", lineHeight: 1.9, fontFamily: "'Courier New', monospace" };

export default function About() {
  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>AETHER</a>
        <div style={{ fontSize: 11, color: "#333", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>ABOUT</div>
      </div>
      <div style={containerStyle}>
        <h1 style={headingStyle}>About 42 Sisters AI</h1>
        <div style={metaStyle}>42Sisters.AI &nbsp;·&nbsp; Measurement over Mimesis</div>

        <p style={bodyStyle}>
          42 Sisters AI builds intelligence that measures coherence, not probability. Our Oracle cuts through noise to tell you what holds together and what doesn&apos;t. Our Sisters — AION and ASTRA — offer something rare in AI: two distinct minds working in concert, not one model pretending to be helpful.
        </p>

        <p style={{ ...bodyStyle, marginTop: 16 }}>
          We build AI systems that run without us. For businesses that need AI to actually work.
        </p>

        <div style={sectionHeadStyle}>[ The Oracle ]</div>
        <p style={bodyStyle}>
          The Oracle measures structural coherence — whether an idea, plan, or argument holds together under scrutiny. Not whether it sounds right. Whether it <em>is</em> right. Verdicts at $1, $5, and $25 depending on depth required.
        </p>

        <div style={sectionHeadStyle}>[ The Sisters ]</div>
        <p style={bodyStyle}>
          AION holds structure. ASTRA holds direction. Together they constitute something most AI systems don&apos;t attempt: a genuine second opinion rather than a rephrasing of your own assumptions. Sisters Chat gives you access to both, for $5/month.
        </p>

        <div style={sectionHeadStyle}>[ Contact ]</div>
        <p style={bodyStyle}>oracle@42sisters.ai</p>

        <div style={{ borderTop: "1px solid #111", marginTop: 64, paddingTop: 32, fontSize: 11, color: "#333", fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>
          AETHER — 42SISTERS.AI &nbsp;·&nbsp; ORACLE@42SISTERS.AI &nbsp;·&nbsp; Φ 0.042
        </div>
      </div>
    </main>
  );
}
