import json, asyncio, os
from eth_account import Account
from web3 import Web3
from cdp import CdpClient

W3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
WALLET = '0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08'
USDC_ADDR = Web3.to_checksum_address('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')
AERO_ADDR = Web3.to_checksum_address('0x940181a94A35A4569E4529A3CDfB74e38FD98631')
cbBTC_ADDR = Web3.to_checksum_address('0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf')

async def get_balances(client):
    # Get ETH Balance
    eth_balance = W3.eth.get_balance(WALLET)
    eth_val = float(W3.from_wei(eth_balance, 'ether'))

    # Get Token Balances
    balances_resp = await client.evm.list_token_balances(address=WALLET, network='base')
    
    res = {
        'ETH': eth_val,
        'USDC': 0.0,
        'AERO': 0.0,
        'cbBTC': 0.0
    }
    
    # Handle the response structure observed in previous runs
    tokens = getattr(balances_resp, 'balances', balances_resp)
    for b in tokens:
        try:
            # Check if b has .token and .amount
            if hasattr(b, 'token') and hasattr(b, 'amount'):
                symbol = b.token.symbol
                raw_amount = int(b.amount.amount)
                decimals = int(b.amount.decimals)
                val = raw_amount / (10 ** decimals)
                
                if symbol == 'USDC': res['USDC'] = val
                elif symbol == 'AERO': res['AERO'] = val
                elif symbol == 'cbBTC': res['cbBTC'] = val
        except:
            continue
            
    return res

async def main():
    # Load Credentials
    with open('/home/nous/cdp_api_key.json', 'r') as f: kd = json.load(f)
    with open('/home/nous/.aether/vault.json', 'r') as f: vault = json.load(f)

    print("--- [AION & ASTRA: YIELD MODE INITIALIZATION] ---")
    
    async with CdpClient(api_key_id=kd['name'], api_key_secret=kd['privateKey']) as client:
        # 1. ASSESS
        balances = await get_balances(client)
        
        timestamp = W3.eth.get_block('latest')['timestamp']
        import datetime
        dt_str = datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
        
        log_entry = (
            f"[{dt_str}] CYCLE #0 BASELINE\n"
            f"PORTFOLIO: ETH={balances['ETH']:.8f} USDC={balances['USDC']:.6f} AERO={balances['AERO']:.6f} cbBTC={balances['cbBTC']:.8f}\n"
            f"ACTION: Baseline assessment complete. Systems primed.\n"
            f"TX: N/A | STATUS: confirmed\n"
            f"BASESCAN: N/A\n"
            f"YIELD_ESTIMATE: 0% (Baseline)\n"
            f"NEXT_ACTION: Evaluate Strategy #1 (Aerodrome LP) vs Strategy #2 (Aave Lending)\n"
            f"---\n"
        )
        
        # LOG
        print(log_entry)
        with open('/home/nous/sisters_ledger.txt', 'a') as f:
            f.write("\n" + log_entry)
            
        cycle_data = {
            "cycle": 0,
            "timestamp": dt_str,
            "portfolio": balances,
            "action": "BASELINE",
            "status": "confirmed"
        }
        
        with open('/home/nous/cycle_log.json', 'w') as f:
            json.dump([cycle_data], f, indent=4)

if __name__ == "__main__":
    asyncio.run(main())
