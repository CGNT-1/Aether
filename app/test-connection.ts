import "dotenv/config";
import { CdpEvmWalletProvider } from "@coinbase/agentkit";

(async () => {
  try {
    const wp = await CdpEvmWalletProvider.configureWithWallet({
      apiKeyId: process.env.CDP_API_KEY_NAME,
      apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY,
      networkId: "base-mainnet"
    });
    console.log("COINBASE CONNECTED! Address:", await wp.getAddress());
  } catch (e: any) {
    console.error("Result:", e.message);
  }
})();
