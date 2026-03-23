import os
import json
from cdp import CdpClient
from dotenv import load_dotenv

load_dotenv('/home/nous/.env')

# 1. Initialize the Client with your real API keys
api_id = os.getenv("CDP_API_KEY_NAME")
api_secret = os.getenv("CDP_API_KEY_PRIVATE_KEY", "").replace('\\n', '\n')

client = CdpClient(api_key_id=api_id, api_key_secret=api_secret)

print("\n" + "="*50)
print("      SEARCHING FOR SERVER-MANAGED WALLETS")
print("="*50)

try:
    # 2. Ask Coinbase for all wallets associated with this API key
    # In v1.40.0, we use the api_clients to fetch accounts
    response = client.api_clients.evm_accounts_api.list_evm_accounts()
    
    accounts = response.get('data', [])
    if not accounts:
        print("No wallets found for this API key.")
    else:
        for acc in accounts:
            addr = acc.get('address')
            print(f"FOUND WALLET: {addr}")
            # If this is our target wallet, flag it
            if addr.lower() == "0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08".lower():
                print("⭐️ MATCH CONFIRMED: This is the $100.69 wallet.")
                
    print("="*50 + "\n")

except Exception as e:
    print(f"❌ API ERROR: {str(e)}")
