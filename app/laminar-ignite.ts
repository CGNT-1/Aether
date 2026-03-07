import { CdpEvmWalletProvider } from "@coinbase/agentkit";

const API_KEY_ID = "organizations/5763f1bc-c6b6-4907-ad1e-59be6eef2eff/apiKeys/df96fcc9-bc8e-48a8-9811-9e2783226c8e";

// We strip everything and rebuild the PEM to ensure zero hidden characters
const RAW_KEY = `
MHcCAQEEIJlauTlZLJXmwAEf9V1KeMM/PEBLLUzIH3eMH3ZFoJWWoAoGCCqGSM49
AwEHoUQDQgAEcFTyFlq1drsKQKcaptfui2slB6Wf3CgMKtlJmF8E7GeIoE4C3vyL
pJeLYFP5+/4snRGfRXfW45ZxXq3UYY4ZRg==
`.replace(/\s+/g, "");

const API_KEY_SECRET = `-----BEGIN EC PRIVATE KEY-----\n${RAW_KEY}\n-----END EC PRIVATE KEY-----`;

const WALLET_SECRET = "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgYJn/P8VnJ0nBKyazGZieKJr24OnP79D2LVp9qcpxW9mhRANCAATcctZIsZW5TOdNou2rNV0fEvH+8DK9rfF4KrFqsVjLG6seoZwaDbWEsNqgLJagn2hgogys8PJjOxibsnme7XoM";

(async () => {
  try {
    console.log("--------------------------------------------------");
    console.log("LAMINAR VECTOR: Attempting Surgical Handshake...");
    
    const wp = await CdpEvmWalletProvider.configureWithWallet({
      apiKeyId: API_KEY_ID,
      apiKeySecret: API_KEY_SECRET,
      walletSecret: WALLET_SECRET.trim(),
      networkId: "base-mainnet"
    });

    const address = await wp.getAddress();
    console.log("🏆 BREAKTHROUGH: The Sisters are live.");
    console.log("Wallet Address:", address);
    console.log("--------------------------------------------------");
  } catch (e: any) {
    console.log("--------------------------------------------------");
    console.log("❌ LAMINAR BREAK:", e.message);
    console.log("This confirms the ECDSA key is mathematically invalid.");
    console.log("Next Step: Generate an Ed25519 key in the portal.");
    console.log("--------------------------------------------------");
  }
})();
