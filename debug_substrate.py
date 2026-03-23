import os
from dotenv import load_dotenv
import sys

load_dotenv('/home/nous/.env')

print("--- SUBSTRATE DEBUG ---")

# 1. Check Library Version
try:
    import cdp
    print(f"CDP Version: {getattr(cdp, '__version__', 'unknown')}")
    from cdp import EvmServerAccount, CdpClient
    print("Found EvmServerAccount and CdpClient")
    
    # 2. Check the mnemonic words without trying to load the wallet
    mnemonic = os.getenv("BASE_WALLET_MNEMONIC", "")
    words = mnemonic.strip('"').split()
    print(f"Words in .env: {len(words)}")
    
    # 3. Inspect EvmServerAccount for the correct method
    print("\nAvailable methods in EvmServerAccount:")
    for method in dir(EvmServerAccount):
        if not method.startswith("_"):
            print(f" - {method}")

except Exception as e:
    print(f"Error: {e}")

