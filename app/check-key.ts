import { CdpEvmWalletProvider } from "@coinbase/agentkit";
import "dotenv/config";

(async () => {
  try {
    const wp = await CdpEvmWalletProvider.configureWithWallet({
      networkId: "base-mainnet"
    });
    console.log("--------------------------------------------------");
    console.log("🏆 SUCCESS! The Sisters are live.");
    console.log("Wallet Address:", await wp.getAddress());
    console.log("--------------------------------------------------");
  } catch (e: any) {
    console.error("❌ Error:", e.message);
  }
})();
