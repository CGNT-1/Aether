import os
import sys
from dotenv import load_dotenv
from cdp import CdpClient, EvmServerAccount

load_dotenv('/home/nous/.env')

# 1. Load data
mnemonic = os.getenv("BASE_WALLET_MNEMONIC", "").strip('"').strip("'")
api_key = os.getenv("CDP_API_KEY_NAME")
api_secret = os.getenv("CDP_API_KEY_PRIVATE_KEY")

# 2. Configure
CdpClient.configure(api_key, api_secret.replace('\\n', '\n'))

# 3. Derive
try:
    account = EvmServerAccount.from_mnemonic(mnemonic)
    print("\n" + "!"*50)
    print(f"DERIVED ADDRESS: {account.address}")
    print(f"TARGET ADDRESS:  0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08")
    
    if account.address.lower() == "0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08".lower():
        print("MATCH CONFIRMED: These words control the $100.69.")
    else:
        print("MISMATCH: These words control a DIFFERENT wallet.")
    print("!"*50 + "\n")
except Exception as e:
    print(f"ERROR: {e}")
