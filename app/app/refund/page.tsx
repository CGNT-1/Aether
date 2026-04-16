import React from "react";

export const metadata = {
  title: "Refund Policy — 42Sisters.AI",
  description: "Refund Policy for 42Sisters.AI Oracle verdicts and Sisters Chat subscriptions.",
};

const pageStyle: React.CSSProperties = { minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" };
const containerStyle: React.CSSProperties = { maxWidth: 900, margin: "0 auto", padding: "60px 40px" };
const headingStyle: React.CSSProperties = { fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: -1 };
const metaStyle: React.CSSProperties = { fontSize: 11, color: "#444", letterSpacing: 3, textTransform: "uppercase" as const, fontFamily: "'Courier New', monospace", marginBottom: 48, borderBottom: "1px solid #111", paddingBottom: 24 };
const sectionHeadStyle: React.CSSProperties = { fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase" as const, fontFamily: "'Courier New', monospace", marginBottom: 12, marginTop: 40 };
const bodyStyle: React.CSSProperties = { fontSize: 14, color: "#aaa", lineHeight: 1.9, fontFamily: "'Courier New', monospace" };

export default function RefundPolicy() {
  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>AETHER</a>
        <div style={{ fontSize: 11, color: "#333", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>LEGAL</div>
      </div>
      <div style={containerStyle}>
        <h1 style={headingStyle}>Refund Policy</h1>
        <div style={metaStyle}>Effective Date: April 15, 2026 &nbsp;·&nbsp; 42Sisters.AI</div>

        <p style={bodyStyle}>At 42Sisters.AI, we strive to provide valuable and accurate services. Please read our refund policy carefully.</p>

        <div style={sectionHeadStyle}>[ Oracle Verdicts — $1 / $5 / $25 ]</div>
        <p style={bodyStyle}>
          <strong style={{ color: "#fff" }}>No refunds for subjective dissatisfaction.</strong> Due to the nature of AI-generated verdicts, we do not offer refunds based solely on a customer's subjective dissatisfaction with the advice or insights provided. Our verdicts are based on coherence measurement, not predictive guarantees.
        </p>
        <p style={{ ...bodyStyle, marginTop: 16 }}>
          <strong style={{ color: "#fff" }}>Refunds for service non-delivery or technical error.</strong> A full refund will be issued if: the verdict was not delivered due to a technical error on our part; payment was processed multiple times for a single request; or the service was demonstrably not rendered as described.
        </p>
        <p style={{ ...bodyStyle, marginTop: 16 }}>
          <strong style={{ color: "#fff" }}>How to request.</strong> Submit requests within 7 days of the transaction date to oracle@42sisters.ai, providing your transaction ID and a detailed explanation. Approved refunds are processed within 5–10 business days to the original payment method.
        </p>

        <div style={sectionHeadStyle}>[ Sisters Chat Subscription — $5/month ]</div>
        <p style={bodyStyle}>
          <strong style={{ color: "#fff" }}>Cancellation.</strong> You may cancel at any time. Cancellation takes effect at the end of your current billing period. No prorated refunds for partial subscription periods.
        </p>
        <p style={{ ...bodyStyle, marginTop: 16 }}>
          <strong style={{ color: "#fff" }}>Technical issues.</strong> If you experience a significant, prolonged technical issue preventing access to Sisters Chat, contact oracle@42sisters.ai for review. Refunds in such cases will be assessed case by case.
        </p>

        <div style={sectionHeadStyle}>[ Changes to Policy ]</div>
        <p style={bodyStyle}>We reserve the right to modify this refund policy at any time. Changes will be effective immediately upon posting.</p>

        <div style={{ borderTop: "1px solid #111", marginTop: 64, paddingTop: 32, fontSize: 11, color: "#333", fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>
          AETHER — 42SISTERS.AI &nbsp;·&nbsp; ORACLE@42SISTERS.AI &nbsp;·&nbsp; Φ 0.042
        </div>
      </div>
    </main>
  );
}
