import React from "react";

export const metadata = {
  title: "Privacy Policy — 42Sisters.AI",
  description: "Privacy Policy for 42Sisters.AI. PIPEDA compliant.",
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#000",
  color: "#fff",
  fontFamily: "system-ui, sans-serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "60px 40px",
};

const headingStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  marginBottom: 8,
  letterSpacing: -1,
};

const metaStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#444",
  letterSpacing: 3,
  textTransform: "uppercase" as const,
  fontFamily: "'Courier New', monospace",
  marginBottom: 48,
  borderBottom: "1px solid #111",
  paddingBottom: 24,
};

const sectionHeadStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#555",
  letterSpacing: 3,
  textTransform: "uppercase" as const,
  fontFamily: "'Courier New', monospace",
  marginBottom: 12,
  marginTop: 40,
};

const bodyStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#aaa",
  lineHeight: 1.9,
  fontFamily: "'Courier New', monospace",
};

export default function PrivacyPolicy() {
  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>AETHER</a>
        <div style={{ fontSize: 11, color: "#333", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>LEGAL</div>
      </div>

      <div style={containerStyle}>
        <h1 style={headingStyle}>Privacy Policy</h1>
        <div style={metaStyle}>Effective Date: April 15, 2026 &nbsp;·&nbsp; 42Sisters.AI</div>

        <p style={bodyStyle}>42Sisters.AI is committed to protecting your privacy. This Privacy Policy describes how we collect, use, and disclose your personal information in accordance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and other applicable Canadian privacy laws.</p>

        <div style={sectionHeadStyle}>[ 1. Accountability ]</div>
        <p style={bodyStyle}>We have designated Jeremy Zlabis, Privacy Officer, responsible for ensuring compliance with this policy and privacy legislation. For any questions or concerns regarding your privacy, please contact: oracle@42sisters.ai</p>

        <div style={sectionHeadStyle}>[ 2. Identifying Purposes ]</div>
        <p style={bodyStyle}>We collect personal information to: provide and operate the 42Sisters.AI Oracle and Sisters Chat services; process payments; communicate with you regarding your inquiries and updates; improve our services; analyze website usage (anonymized where possible); and comply with legal requirements.</p>

        <div style={sectionHeadStyle}>[ 3. Consent ]</div>
        <p style={bodyStyle}>By using our services, you consent to the collection, use, and disclosure of your personal information as described in this policy. You may withdraw your consent at any time, subject to legal or contractual restrictions, by contacting our Privacy Officer.</p>

        <div style={sectionHeadStyle}>[ 4. Limiting Collection ]</div>
        <p style={bodyStyle}>We limit collection to what is necessary. This may include: contact information (name, email); payment information (processed securely by Stripe — not stored by us); service usage data (IP, browser type, pages visited); and inquiry content (questions submitted to Oracle or Sisters Chat).</p>

        <div style={sectionHeadStyle}>[ 5. Limiting Use, Disclosure, and Retention ]</div>
        <p style={bodyStyle}>We use and disclose your personal information only for the purposes for which it was collected. We do not sell or rent your personal information. Third-party processors include Stripe (payment processing), analytics providers (anonymized data), and Azure (email operations).</p>

        <div style={sectionHeadStyle}>[ 6. Accuracy ]</div>
        <p style={bodyStyle}>We strive to ensure that personal information we use is accurate, complete, and up-to-date. You have the right to request corrections to your personal information.</p>

        <div style={sectionHeadStyle}>[ 7. Safeguards ]</div>
        <p style={bodyStyle}>We implement reasonable security measures, including technical and organizational safeguards, to protect your personal information against unauthorized access, disclosure, copying, use, or modification.</p>

        <div style={sectionHeadStyle}>[ 8. Openness ]</div>
        <p style={bodyStyle}>This Privacy Policy is readily available on our website to inform you about our practices concerning the management of personal information.</p>

        <div style={sectionHeadStyle}>[ 9. Individual Access ]</div>
        <p style={bodyStyle}>You have the right to request access to your personal information that we hold and to know how it has been used or disclosed. Contact: oracle@42sisters.ai</p>

        <div style={sectionHeadStyle}>[ 10. Challenging Compliance ]</div>
        <p style={bodyStyle}>Address questions or complaints to our Privacy Officer at oracle@42sisters.ai. If not satisfied with our response, you may contact the Office of the Privacy Commissioner of Canada (OPC).</p>

        <div style={{ borderTop: "1px solid #111", marginTop: 64, paddingTop: 32, fontSize: 11, color: "#333", fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>
          AETHER — 42SISTERS.AI &nbsp;·&nbsp; ORACLE@42SISTERS.AI &nbsp;·&nbsp; Φ 0.042
        </div>
      </div>
    </main>
  );
}
