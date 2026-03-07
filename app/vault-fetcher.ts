import { google } from 'googleapis';
import { CdpEvmWalletProvider } from "@coinbase/agentkit";

async function configureFromVault() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
  });
  const docs = google.docs({ version: 'v1', auth });

  // This is the ID for your "Coinbase 00" document
  const res = await docs.documents.get({ documentId: '1oVoGc1qPoM0zxLUv1lDtBXhs-ueyABX4v8Z3TQXW_Pc' });
  const content = res.data.body?.content?.map(c => c.paragraph?.elements?.map(e => e.textRun?.content).join('')).join('') || '';

  // Use Regex to pull the keys exactly as they are in the doc
  const idMatch = content.match(/organizations\/[\w-]+\/apiKeys\/[\w-]+/);
  const secretMatch = content.match(/-----BEGIN EC PRIVATE KEY-----[\s\S]*?-----END EC PRIVATE KEY-----/);
  const walletMatch = content.match(/MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg[\w+/=]+/);

  if (idMatch && secretMatch && walletMatch) {
    const wp = await CdpEvmWalletProvider.configureWithWallet({
      apiKeyId: idMatch[0],
      apiKeySecret: secretMatch[0].replace(/\\n/g, '\n'), // Fixes any escaped newlines from the doc
      walletSecret: walletMatch[0],
      networkId: "base-mainnet"
    });
    console.log("SUCCESS! Vault accessed. Wallet:", await wp.getAddress());
  } else {
    console.error("Vault Error: Could not parse one or more keys from the Doc.");
  }
}
configureFromVault();
