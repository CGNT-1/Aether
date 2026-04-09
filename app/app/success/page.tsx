"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function Redirect() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session_id");

  useEffect(() => {
    router.replace(sessionId ? `/oracle/result?session_id=${sessionId}` : "/oracle/result");
  }, [sessionId, router]);

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "'Courier New', monospace", fontSize: 12, letterSpacing: 2 }}>
      LOADING...
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "'Courier New', monospace", fontSize: 12, letterSpacing: 2 }}>
        LOADING...
      </div>
    }>
      <Redirect />
    </Suspense>
  );
}
