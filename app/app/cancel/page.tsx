"use client";

const G   = "#34d399";
const DIM = "#555";

export default function CancelPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <nav style={{ borderBottom: "1px solid #1a1a1a", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 48 }}>
        <a href="/" style={{ fontFamily: "'Courier New', monospace", fontSize: 12, letterSpacing: 2, color: DIM, textDecoration: "none" }}>AETHER</a>
      </nav>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: DIM, letterSpacing: 3, textTransform: "uppercase", marginBottom: 24, fontFamily: "'Courier New', monospace" }}>Payment Cancelled</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>No charge made.</h1>
          <p style={{ color: "#aaa", fontSize: 16, lineHeight: 1.6, marginBottom: 40 }}>
            You cancelled before completing payment. Your submission is waiting — go back and try again whenever you're ready.
          </p>
          <a href="/#oracle" style={{ background: G, color: "#000", fontWeight: 600, padding: "12px 32px", borderRadius: 8, textDecoration: "none", fontSize: 15 }}>
            Back to Oracle →
          </a>
        </div>
      </div>
    </main>
  );
}
