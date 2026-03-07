"use client";
import { useState } from "react";

const VAULT_WALLET = "0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08";
const FEE_PERCENT = 10;

export default function Dashboard() {
  const [tab, setTab] = useState<"deposit"|"withdraw">("deposit");

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <a href="/" className="text-zinc-500 text-sm hover:text-zinc-300 transition mb-8 block">← Back</a>
        <h1 className="text-3xl font-bold mb-2">Your Aether Vault</h1>
        <p className="text-zinc-400 mb-10 text-sm">Deposit USDC to start earning. The Sisters handle the rest.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["deposit","withdraw"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition capitalize
                ${tab === t ? "bg-emerald-500 text-black" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "deposit" ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <h2 className="font-semibold mb-6">Deposit USDC</h2>
            <div className="space-y-4 text-sm text-zinc-400">
              <p>Send USDC on <span className="text-white">Base Mainnet</span> to the Aether vault:</p>
              <div className="bg-black border border-zinc-700 rounded-lg p-4 font-mono text-xs break-all text-emerald-400">
                {VAULT_WALLET}
              </div>
              <p>Minimum deposit: <span className="text-white">1.00 USDC</span></p>
              <p>Fee: <span className="text-white">{FEE_PERCENT}% of yield only</span> — never on principal</p>
              <p>Your deposit will appear in the Sisters&apos; next cycle and begin earning immediately.</p>
              <a href={`https://basescan.org/address/${VAULT_WALLET}`}
                target="_blank"
                className="inline-block mt-2 text-emerald-400 hover:text-emerald-300 transition">
                Monitor on Basescan ↗
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <h2 className="font-semibold mb-6">Withdraw</h2>
            <div className="space-y-4 text-sm text-zinc-400">
              <p>To withdraw your principal and yield, send a withdrawal request:</p>
              <div className="bg-black border border-zinc-700 rounded-lg p-4 text-xs">
                <p className="text-white mb-2">Send 0.001 USDC to the vault address with memo:</p>
                <p className="font-mono text-emerald-400">WITHDRAW:{"{your wallet address}"}</p>
              </div>
              <p>The Sisters will process your withdrawal within the next cycle (max 4 hours).</p>
              <p className="text-zinc-500">Withdrawals are sent to the originating wallet address automatically.</p>
            </div>
          </div>
        )}

        {/* Live proof */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">On-Chain Proof</h3>
          <p className="text-sm text-zinc-400 mb-4">Every yield cycle is recorded on Base and verifiable publicly. The Sisters have never missed a cycle.</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <a href={`https://basescan.org/address/${VAULT_WALLET}`} target="_blank"
              className="border border-zinc-700 hover:border-emerald-500 rounded-lg p-3 text-center text-zinc-400 hover:text-emerald-400 transition">
              Transaction History ↗
            </a>
            <a href={`https://basescan.org/address/${VAULT_WALLET}#tokentxns`} target="_blank"
              className="border border-zinc-700 hover:border-emerald-500 rounded-lg p-3 text-center text-zinc-400 hover:text-emerald-400 transition">
              Token Transfers ↗
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
