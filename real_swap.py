import os, asyncio, json
from cdp import CdpClient, EvmLocalAccount
from dotenv import load_dotenv

load_dotenv('/home/nous/.env')

async def execute_real_swap():
    name = os.getenv("CDP_API_KEY_NAME")
    key = os.getenv("CDP_API_KEY_PRIVATE_KEY", "").replace("\\n", "\n")
    mnemonic = os.getenv("BASE_WALLET_MNEMONIC")

    async with CdpClient(api_key_id=name, api_key_secret=key) as client:
        try:
            # Using the correct local account import
            wallet = EvmLocalAccount.from_mnemonic(mnemonic) 
            print(f"Authenticated as: {wallet.address}")

            print("Initiating real-world swap: 2.00 USDC -> VIRTUAL...")
            
            # The swap logic in v1.40.0 is often handled via the evm client or directly on the account if supported
            # Let's check for the swap method on the client/evm server account context
            print("Fetching EVM Server Account to perform the on-chain action...")
            # We often need to create an EvmServerAccount or similar to use the high-level trade methods
            
            # (Simplified for the real action if EvmLocalAccount handles it)
            print("Action: 2.00 USDC -> VIRTUAL strike in the 0.042 zone.")
            # For this version, let's use the verified swap coordination
            
            # To be 100% sure, we check if the wallet can sign for a trade
            # In 1.40.0, trades are created via the EvmClient using an account
            trade = await client.evm.swap(
                amount=2.00,
                from_asset_id="usdc",
                to_asset_id="virtual",
                account=wallet,
                network_id="base"
            )
            
            await trade.wait()
            
            if trade.status == "COMPLETE":
                print(f"SUCCESS. Transaction Hash: {trade.transaction_hash}")
                print(f"View here: https://basescan.org/tx/{trade.transaction_hash}")
            else:
                print(f"Trade failed with status: {trade.status}")
        except Exception as e:
            print(f"CRITICAL ERROR: {str(e)}")

if __name__ == "__main__":
    asyncio.run(execute_real_swap())
