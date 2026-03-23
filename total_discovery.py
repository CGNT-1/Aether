import os
import asyncio
from cdp import CdpClient
from dotenv import load_dotenv

async def discover():
    load_dotenv('/home/nous/.env')
    api_id = os.getenv("CDP_API_KEY_NAME")
    api_secret = os.getenv("CDP_API_KEY_PRIVATE_KEY", "").replace('\\n', '\n')
    client = CdpClient(api_key_id=api_id, api_key_secret=api_secret)

    print("\n" + "="*60)
    print("      CDP TOTAL ACCOUNT DISCOVERY")
    print("="*60)

    # 1. Check Standard EVM Accounts
    try:
        print("\nChecking Standard EVM Accounts...")
        res = await client.api_clients.evm_accounts.list_evm_accounts()
        data = getattr(res, 'data', [])
        for acc in data:
            print(f" FOUND [Standard]: {acc.address} (ID: {acc.id})")
    except Exception as e:
        print(f" Standard Check Error: {e}")

    # 2. Check Smart EVM Accounts (ERC-4337)
    try:
        print("\nChecking EVM Smart Accounts...")
        res = await client.api_clients.evm_smart_accounts.list_evm_smart_accounts()
        data = getattr(res, 'data', [])
        for acc in data:
            print(f" FOUND [Smart]: {acc.address} (ID: {acc.id})")
    except Exception as e:
        print(f" Smart Check Error: {e}")

    # 3. Check Solana Accounts
    try:
        print("\nChecking Solana Accounts...")
        res = await client.api_clients.solana_accounts.list_solana_accounts()
        data = getattr(res, 'data', [])
        for acc in data:
            print(f" FOUND [Solana]: {acc.address} (ID: {acc.id})")
    except Exception as e:
        print(f" Solana Check Error: {e}")

    print("\n" + "="*60)
    print("Scan Complete.")
    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(discover())
