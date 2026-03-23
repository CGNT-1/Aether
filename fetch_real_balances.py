import os
import asyncio
import json
from cdp import CdpClient
from dotenv import load_dotenv

async def run_audit():
    # 1. Load your real keys
    load_dotenv('/home/nous/.env')
    api_id = os.getenv("CDP_API_KEY_NAME")
    api_secret = os.getenv("CDP_API_KEY_PRIVATE_KEY", "").replace('\\n', '\n')

    # 2. Connect to the real engine
    client = CdpClient(api_key_id=api_id, api_key_secret=api_secret)

    print("\n" + "="*60)
    print("      CDP ASYNC WALLET AUDIT (GROUND TRUTH)")
    print("="*60)

    try:
        # 3. List all wallets
        response = await client.api_clients.evm_accounts.list_evm_accounts()
        
        # In v1.40.0, the accounts are in response.data or the response itself is iterable
        # We handle the object structure directly here
        accounts = []
        if hasattr(response, 'data'):
            accounts = response.data
        elif isinstance(response, list):
            accounts = response
        else:
            # Check for common Pydantic model patterns
            try:
                accounts = response.model_dump().get('data', [])
            except:
                accounts = []

        target_found = False
        for acc in accounts:
            # Safely get address and ID whether it's an object or a dict
            addr = getattr(acc, 'address', None) or (acc.get('address') if isinstance(acc, dict) else None)
            acc_id = getattr(acc, 'id', None) or (acc.get('id') if isinstance(acc, dict) else None)
            
            if not addr: continue
            
            print(f"Detected Wallet: {addr}")
            
            if str(addr).lower() == "0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08".lower():
                print(f"⭐️ MATCH: Target wallet identified.")
                print(f"⭐️ ACCOUNT ID: {acc_id}")
                target_found = True
                
                # 4. Fetch the real-time balances
                bal_res = await client.api_clients.evm_accounts.list_evm_token_balances(account_id=acc_id)
                balances = getattr(bal_res, 'data', [])
                
                print("\nREAL-TIME BALANCES:")
                for b in balances:
                    print(f"  Asset: {b.symbol:<8} | Amount: {b.amount}")

        if not target_found:
            print("\n❌ TARGET ADDRESS NOT FOUND. Verify API keys in .env")
            print("Note: If no wallets appear, the API Key may not have permissions.")

        print("="*60 + "\n")

    except Exception as e:
        print(f"❌ API ERROR: {str(e)}")

if __name__ == "__main__":
    asyncio.run(run_audit())
