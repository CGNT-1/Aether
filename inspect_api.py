import os
from cdp import CdpClient, EvmServerAccount
from dotenv import load_dotenv

load_dotenv('/home/nous/.env')
api_id = os.getenv("CDP_API_KEY_NAME")
api_secret = os.getenv("CDP_API_KEY_PRIVATE_KEY", "").replace('\\n', '\n')

client = CdpClient(api_key_id=api_id, api_key_secret=api_secret)

print("\n--- SEARCHING FOR ACCOUNT LISTING ATTRIBUTES ---")
# 1. Check the api_clients object for likely names
for attr in dir(client.api_clients):
    if "account" in attr.lower():
        print(f"Found on api_clients: {attr}")

# 2. Check the EvmServerAccount class for listing methods
print("\n--- SEARCHING EVMSERVERACCOUNT FOR CLASS METHODS ---")
for attr in dir(EvmServerAccount):
    if not attr.startswith("_"):
        print(f"Found on EvmServerAccount: {attr}")

