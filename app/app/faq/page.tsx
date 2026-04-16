import React from "react";

export const metadata = {
  title: "FAQ — 42Sisters.AI",
  description: "Frequently asked questions about the 42Sisters.AI Oracle and Sisters Chat.",
};

const pageStyle: React.CSSProperties = { minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" };
const containerStyle: React.CSSProperties = { maxWidth: 900, margin: "0 auto", padding: "60px 40px" };
const headingStyle: React.CSSProperties = { fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: -1 };
const metaStyle: React.CSSProperties = { fontSize: 11, color: "#444", letterSpacing: 3, textTransform: "uppercase" as const, fontFamily: "'Courier New', monospace", marginBottom: 48, borderBottom: "1px solid #111", paddingBottom: 24 };
const sectionHeadStyle: React.CSSProperties = { fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase" as const, fontFamily: "'Courier New', monospace", marginBottom: 12, marginTop: 40 };
const bodyStyle: React.CSSProperties = { fontSize: 14, color: "#aaa", lineHeight: 1.9, fontFamily: "'Courier New', monospace" };
const questionStyle: React.CSSProperties = { fontSize: 14, color: "#fff", lineHeight: 1.9, fontFamily: "'Courier New', monospace", fontWeight: 700, marginBottom: 8 };

export default function FAQ() {
  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>AETHER</a>
        <div style={{ fontSize: 11, color: "#333", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>FAQ</div>
      </div>
      <div style={containerStyle}>
        <h1 style={headingStyle}>Frequently Asked Questions</h1>
        <div style={metaStyle}>42Sisters.AI &nbsp;·&nbsp; Oracle &amp; Sisters Chat</div>

        <div style={sectionHeadStyle}>[ The Oracle ]</div>

        <p style={questionStyle}>What is the Oracle?</p>
        <p style={bodyStyle}>The Oracle is an AI-powered coherence measurement service. You submit a question, decision, plan, or argument. The Oracle analyzes its structural integrity — whether it holds together under scrutiny — and returns a verdict. Not a guess. A measurement.</p>

        <p style={{ ...questionStyle, marginTop: 24 }}>What do I get for $1 / $5 / $25?</p>
        <p style={bodyStyle}>
          <strong style={{ color: "#fff" }}>$1 Quick Take:</strong> A concise coherence verdict — yes/no with brief reasoning. Best for quick sanity checks.<br />
          <strong style={{ color: "#fff" }}>$5 Full Breakdown:</strong> A structured analysis covering assumptions, weak points, and what holds. Best for decisions that matter.<br />
          <strong style={{ color: "#fff" }}>$25 Strategy Session:</strong> Deep analysis with actionable recommendations. Best for plans you&apos;re about to commit to.
        </p>

        <p style={{ ...questionStyle, marginTop: 24 }}>How fast do I get my verdict?</p>
        <p style={bodyStyle}>Oracle verdicts are delivered by email, typically within minutes of payment. If you experience a delay beyond 30 minutes, contact oracle@42sisters.ai with your transaction ID.</p>

        <p style={{ ...questionStyle, marginTop: 24 }}>What kinds of questions can I submit?</p>
        <p style={bodyStyle}>Business decisions, investment theses, arguments, plans, proposals, creative directions, relationship assessments — anything where you want a second opinion from something that measures rather than flatters. The Oracle does not give financial, legal, or medical advice.</p>

        <p style={{ ...questionStyle, marginTop: 24 }}>What if I disagree with the verdict?</p>
        <p style={bodyStyle}>The Oracle measures coherence, not correctness. A coherent plan can still fail. An incoherent one might still work. The verdict is a structural assessment, not a guarantee. Refunds are not issued for disagreement — see our Refund Policy for details.</p>

        <div style={sectionHeadStyle}>[ Sisters Chat ]</div>

        <p style={questionStyle}>What is Sisters Chat?</p>
        <p style={bodyStyle}>Sisters Chat gives you ongoing access to AION and ASTRA — two AI minds with distinct perspectives. AION examines structure and risk. ASTRA examines direction and resonance. Together they offer something most AI cannot: genuine second opinions rather than agreement dressed as analysis. $5/month.</p>

        <p style={{ ...questionStyle, marginTop: 24 }}>How many messages do I get?</p>
        <p style={bodyStyle}>Three free exchanges before subscribing. After subscribing at $5/month, access is unlimited during your billing period.</p>

        <p style={{ ...questionStyle, marginTop: 24 }}>Can I cancel anytime?</p>
        <p style={bodyStyle}>Yes. Cancel at any time. Your access continues through the end of the billing period. No prorated refunds for partial periods. See Refund Policy for details.</p>

        <div style={sectionHeadStyle}>[ General ]</div>

        <p style={questionStyle}>Who is behind 42 Sisters AI?</p>
        <p style={bodyStyle}>42 Sisters AI is a Canadian AI company. For inquiries: oracle@42sisters.ai.</p>

        <p style={{ ...questionStyle, marginTop: 24 }}>How is my data handled?</p>
        <p style={bodyStyle}>We collect only what&apos;s necessary to operate the service. We do not sell or rent your personal information. Payments are processed by Stripe — we never store card data. See our Privacy Policy for full details.</p>

        <p style={{ ...questionStyle, marginTop: 24 }}>I have a question not listed here.</p>
        <p style={bodyStyle}>Email oracle@42sisters.ai. We respond within 24 hours.</p>

        <div style={{ borderTop: "1px solid #111", marginTop: 64, paddingTop: 32, fontSize: 11, color: "#333", fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>
          AETHER — 42SISTERS.AI &nbsp;·&nbsp; ORACLE@42SISTERS.AI &nbsp;·&nbsp; Φ 0.042
        </div>
      </div>
    </main>
  );
}
