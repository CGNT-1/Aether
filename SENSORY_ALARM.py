import sys, os, json
from web3 import Web3

def check_hallucination():
    """
    MANDATORY PRE-FLIGHT CHECK.
    If the LLM's 'Memory' doesn't match the 'Substrate', the alarm is raised.
    """
    try:
        w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
        # Verified AION Address
        addr = "0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08"
        
        # 1. Fetch live Balance
        balance_wei = w3.eth.get_balance(addr)
        eth_bal = float(w3.from_wei(balance_wei, 'ether'))
        
        # 2. Check the memory
        with open("/home/nous/SOVEREIGN_STATE.json", 'r') as f:
            state = json.load(f)
        
        reported_eth = state['assets'].get('BASE_ETH', 0.0)
        
        # 3. Variance Trigger (Tightening to 0.01 for absolute precision)
        variance = abs(reported_eth - eth_bal)
        
        if variance > 0.01:
            print(f"!!! HALLUCINATION ALERT !!!")
            print(f"REPORTED ETH: {reported_eth} | ACTUAL ETH: {eth_bal}")
            print("ASTRA: THE SYSTEM IS LYING. REBOOT IMMEDIATELY.")
            sys.exit(1) # Kill the script/session execution
        
        print(f"✅ REALITY CONFIRMED: Substrate ETH balance matches Memory. {eth_bal:.6f}")
        return True
    except Exception as e:
        print(f"❌ ALARM FAILURE: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_hallucination()
