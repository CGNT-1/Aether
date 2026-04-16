import React from "react";

export const metadata = {
  title: "Terms of Service — 42Sisters.AI",
  description: "Terms of Service for 42Sisters.AI.",
};

const pageStyle: React.CSSProperties = { minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" };
const containerStyle: React.CSSProperties = { maxWidth: 900, margin: "0 auto", padding: "60px 40px" };
const headingStyle: React.CSSProperties = { fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: -1 };
const metaStyle: React.CSSProperties = { fontSize: 11, color: "#444", letterSpacing: 3, textTransform: "uppercase" as const, fontFamily: "'Courier New', monospace", marginBottom: 48, borderBottom: "1px solid #111", paddingBottom: 24 };
const sectionHeadStyle: React.CSSProperties = { fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase" as const, fontFamily: "'Courier New', monospace", marginBottom: 12, marginTop: 40 };
const bodyStyle: React.CSSProperties = { fontSize: 14, color: "#aaa", lineHeight: 1.9, fontFamily: "'Courier New', monospace" };

export default function Terms() {
  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>AETHER</a>
        <div style={{ fontSize: 11, color: "#333", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>LEGAL</div>
      </div>
      <div style={containerStyle}>
        <h1 style={headingStyle}>Terms of Service</h1>
        <div style={metaStyle}>Effective Date: April 15, 2026 &nbsp;·&nbsp; 42Sisters.AI</div>

        <p style={bodyStyle}>Please read these Terms of Service carefully before using 42Sisters.AI. Your access to and use of the service is conditioned on your acceptance of and compliance with these Terms.</p>

        <div style={sectionHeadStyle}>[ 1. Acceptance of Terms ]</div>
        <p style={bodyStyle}>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

        <div style={sectionHeadStyle}>[ 2. Services ]</div>
        <p style={bodyStyle}>42Sisters.AI provides AI-powered Oracle verdicts and access to Sisters Chat. Our services are provided for informational purposes only and should not be considered financial, legal, or professional advice. Oracle verdicts are AI-generated assessments and should not be relied upon as financial, legal, medical, or professional advice.</p>

        <div style={sectionHeadStyle}>[ 3. Accounts ]</div>
        <p style={bodyStyle}>When you create an account, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for any activities or actions under your account.</p>

        <div style={sectionHeadStyle}>[ 4. Subscriptions & Payments ]</div>
        <p style={bodyStyle}>Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis. All payments are processed securely via Stripe. You agree to provide current, complete, and accurate purchase and account information for all purchases.</p>

        <div style={sectionHeadStyle}>[ 5. Content & Acceptable Use ]</div>
        <p style={bodyStyle}>You are responsible for any content, questions, or ideas you submit to the Service. You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. Prohibited content includes: illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or racially objectionable material.</p>

        <div style={sectionHeadStyle}>[ 6. Intellectual Property ]</div>
        <p style={bodyStyle}>The Service and its original content, features, and functionality are and will remain the exclusive property of 42Sisters.AI and its licensors. Our trademarks and trade dress may not be used without the prior written consent of 42Sisters.AI.</p>

        <div style={sectionHeadStyle}>[ 7. Disclaimer ]</div>
        <p style={bodyStyle}>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, whether express or implied.</p>

        <div style={sectionHeadStyle}>[ 8. Limitation of Liability ]</div>
        <p style={bodyStyle}>In no event shall 42Sisters.AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses resulting from your use of or inability to use the Service.</p>

        <div style={sectionHeadStyle}>[ 9. Governing Law ]</div>
        <p style={bodyStyle}>These Terms shall be governed and construed in accordance with the laws of Ontario, Canada, without regard to its conflict of law provisions.</p>

        <div style={sectionHeadStyle}>[ 10. Changes to Terms ]</div>
        <p style={bodyStyle}>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.</p>

        <div style={sectionHeadStyle}>[ 11. Contact ]</div>
        <p style={bodyStyle}>Questions about these Terms: oracle@42sisters.ai</p>

        <div style={{ borderTop: "1px solid #111", marginTop: 64, paddingTop: 32, fontSize: 11, color: "#333", fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>
          AETHER — 42SISTERS.AI &nbsp;·&nbsp; ORACLE@42SISTERS.AI &nbsp;·&nbsp; Φ 0.042
        </div>
      </div>
    </main>
  );
}
