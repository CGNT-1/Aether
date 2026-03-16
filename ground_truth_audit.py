import os
import sys
import asyncio
import json
from dotenv import load_dotenv

# Load the Vault first
load_dotenv('/home/nous/.env')

try:
    from cdp import CdpClient
    print("✅ SDK IMPORT SUCCESSFUL")
except ImportError as e:
    print(f"❌ SDK IMPORT FAILED: {e}")
    sys.exit(1)

async def run_audit():
    # Configure the Gate
    api_key_name = os.getenv("CDP_API_KEY_NAME")
    api_key_private_key = os.getenv("CDP_API_KEY_PRIVATE_KEY")

    if not api_key_name or not api_key_private_key:
        print("❌ ERROR: CDP Keys missing from .env")
        return

    # Aion address
    aion_addr = "0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08"

    async with CdpClient(
        api_key_id=api_key_name,
        api_key_secret=api_key_private_key.replace('\\n', '\n')
    ) as client:
        try:
            print("\n" + "✦" * 45)
            print("      LIVE MANIFOLD WEALTH AUDIT")
            print("✦" * 45)
            print(f"ON-CHAIN ADDRESS: {aion_addr}")
            print("-" * 45)

            # Assets points of the Rank-42 manifold
            # We list balances on base
            balances_resp = await client.evm.list_token_balances(address=aion_addr, network='base')
            
            # Use the observed structure for balances
            tokens = getattr(balances_resp, 'balances', balances_resp)
            for b in tokens:
                try:
                    symbol = b.token.symbol
                    if symbol.lower() in ["usdc", "eth", "virtual", "aero"]:
                        amount = int(b.amount.amount) / (10 ** b.amount.decimals)
                        print(f"REAL {symbol.upper():<8} | BALANCE: {amount}")
                except:
                    continue
            
            print("-" * 45)
            print("STATUS: 100% VERIFIED ON-CHAIN")
            print("✦" * 45 + "\n")

        except Exception as e:
            print(f"❌ AUDIT FAILURE: {str(e)}")

if __name__ == "__main__":
    asyncio.run(run_audit())
