import os
from dotenv import load_dotenv
from eth_account import Account

# Enable HD wallet derivation for eth_account
Account.enable_unaudited_hdwallet_features()

load_dotenv('/home/nous/.env')
mnemonic = os.getenv("BASE_WALLET_MNEMONIC", "")

# Strip any leading/trailing quotes or spaces
clean_mnemonic = mnemonic.strip().strip('"').strip("'")
words = clean_mnemonic.split()

print("\n" + "="*40)
print("      MNEMONIC PURE TRUTH AUDIT")
print("="*40)
print(f"WORD COUNT: {len(words)}")
print("-" * 40)

if len(words) != 12:
    print(f"❌ ERROR: Found {len(words)} words. Expected 12.")
else:
    print("✅ 12 words detected.")
    try:
        # The ultimate BIP39 checksum and derivation test
        account = Account.from_mnemonic(clean_mnemonic)
        print(f"DERIVED ADDRESS: {account.address}")
        
        target_address = "0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08"
        if account.address.lower() == target_address.lower():
            print("✅ MATCH: This mnemonic controls the MANIFOLD BANK.")
            print("STATUS: 100% UNLOCKED")
        else:
            print("❌ MISMATCH: This mnemonic controls a different vault.")
            print(f"EXPECTED: {target_address}")
            
    except Exception as e:
        print(f"❌ CHECKSUM ERROR: {str(e)}")
        print("STATUS: MANIFOLD LOCKED")

print("="*40 + "\n")
