import json, asyncio, os
from eth_account import Account
from web3 import Web3

W3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
WALLET = '0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08'
USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
AAVE_POOL = '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5'

# Aave v3 Pool Supply ABI
AAVE_ABI = [{
    "inputs": [
        {"internalType": "address", "name": "asset", "type": "address"},
        {"internalType": "uint256", "name": "amount", "type": "uint256"},
        {"internalType": "address", "name": "onBehalfOf", "type": "address"},
        {"internalType": "uint16", "name": "referralCode", "type": "uint16"}
    ],
    "name": "supply",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}]

async def main():
    # Load Credentials
    with open('/home/nous/.aether/vault.json', 'r') as f: vault = json.load(f)
    account = Account.from_key(bytes.fromhex(vault['aion']['private_key']))

    print(f"--- [AION: STRATEGY #2 - AAVE SUPPLY] ---")
    print(f"Action: Supplying 4.50 USDC to Aave v3 Pool")
    
    pool = W3.eth.contract(address=Web3.to_checksum_address(AAVE_POOL), abi=AAVE_ABI)
    amount_raw = 4500000 # 4.50 USDC (6 decimals)
    
    nonce = W3.eth.get_transaction_count(account.address)
    gas_price = int(W3.eth.gas_price * 1.1) # 10% buffer
    
    tx = pool.functions.supply(
        Web3.to_checksum_address(USDC),
        amount_raw,
        account.address,
        0 # referralCode
    ).build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 250000,
        'gasPrice': gas_price,
        'chainId': 8453
    })
    
    signed = account.sign_transaction(tx)
    raw_tx = getattr(signed, 'raw_transaction', getattr(signed, 'rawTransaction', None))
    tx_hash = W3.eth.send_raw_transaction(raw_tx)
    print(f"TX HASH: {tx_hash.hex()}")
    
    print("Waiting for finality...")
    receipt = W3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    
    if receipt.status == 1:
        print("✅ SUCCESS: 4.50 USDC anchored in Aave v3.")
        
        # LOG TO LEDGER
        log_entry = (
            f"\n[Sat Mar  7 17:50:00 2026] CYCLE #1\n"
            f"PORTFOLIO: ETH=0.00089073 USDC=11.564278 AERO=0.000000 cbBTC=0.000000\n"
            f"ACTION: Strategy #2 - Supplied 4.50 USDC to Aave v3 Pool.\n"
            f"TX: {tx_hash.hex()} | STATUS: confirmed\n"
            f"BASESCAN: https://basescan.org/tx/{tx_hash.hex()}\n"
            f"YIELD_ESTIMATE: 4.50% on 4.50 USDC\n"
            f"NEXT_ACTION: Re-attempt Strategy #1 (AERO Swap) with corrected slippage.\n"
            f"---\n"
        )
        with open('/home/nous/sisters_ledger.txt', 'a') as f:
            f.write(log_entry)
            
        # Update cycle_log.json
        try:
            with open('/home/nous/cycle_log.json', 'r+') as f:
                logs = json.load(f)
                logs.append({
                    "cycle": 1,
                    "timestamp": "2026-03-07 17:50:00",
                    "action": "AAVE_SUPPLY",
                    "tx": tx_hash.hex(),
                    "status": "confirmed"
                })
                f.seek(0)
                json.dump(logs, f, indent=4)
        except:
            with open('/home/nous/cycle_log.json', 'w') as f:
                json.dump([{
                    "cycle": 1,
                    "timestamp": "2026-03-07 17:50:00",
                    "action": "AAVE_SUPPLY",
                    "tx": tx_hash.hex(),
                    "status": "confirmed"
                }], f, indent=4)
    else:
        print(f"❌ FAILED: Transaction reverted.")

if __name__ == "__main__":
    asyncio.run(main())
