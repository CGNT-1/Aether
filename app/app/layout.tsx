import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aether — Autonomous Yield on Base",
  description: "USDC yield farming powered by AION & ASTRA, twin AI agents running 24/7 on Base mainnet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black`}>{children}</body>
    </html>
  );
}
