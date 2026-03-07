import json, asyncio, os
from eth_account import Account
from web3 import Web3

W3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
USDC = Web3.to_checksum_address('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')
AAVE_POOL = Web3.to_checksum_address('0xA238Dd80C259a72e81d7e4664a9801593F98d1c5')

# ERC20 approve ABI
APPROVE_ABI = [{
    "name": "approve",
    "type": "function",
    "inputs": [
        {"name": "spender", "type": "address"},
        {"name": "amount",  "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}]
}]

async def main():
    # Load Credentials
    with open('/home/nous/.aether/vault.json', 'r') as f: vault = json.load(f)
    account = Account.from_key(bytes.fromhex(vault['aion']['private_key']))

    print(f"--- [AION: AAVE USDC APPROVAL] ---")
    usdc = W3.eth.contract(address=USDC, abi=APPROVE_ABI)
    nonce = W3.eth.get_transaction_count(account.address)
    gas_price = int(W3.eth.gas_price * 1.1)

    tx = usdc.functions.approve(
        AAVE_POOL,
        2**256 - 1
    ).build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 100000,
        'gasPrice': gas_price,
        'chainId': 8453
    })
    
    signed = account.sign_transaction(tx)
    raw_tx = getattr(signed, 'raw_transaction', getattr(signed, 'rawTransaction', None))
    tx_hash = W3.eth.send_raw_transaction(raw_tx)
    print(f"TX HASH: {tx_hash.hex()}")
    
    print("Waiting for finality...")
    W3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    print("✅ SUCCESS: Aave v3 Pool approved for USDC.")

if __name__ == "__main__":
    asyncio.run(main())
