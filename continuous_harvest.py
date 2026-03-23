#!/usr/bin/env python3
import os
import time
from web3 import Web3
from dotenv import load_dotenv
from eth_account import Account

# Ensure we can find the .env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

RPC_URL = os.getenv('BASE_RPC', 'https://mainnet.base.org')
PRIVATE_KEY = os.getenv('PRIVATE_KEY')
w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not PRIVATE_KEY:
    print("❌ VETO: PRIVATE_KEY missing.")
    exit(1)

account = Account.from_key(PRIVATE_KEY)
wallet = account.address

# Aerodrome V2 Base
ROUTER = w3.to_checksum_address('0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43')
CL_FACTORY = w3.to_checksum_address('0x420dd381b31aef6683db6b902084cb0ffece40da')
WETH = w3.to_checksum_address('0x4200000000000000000000000000000000000006')
USDC = w3.to_checksum_address('0x833589fCD6eDb6E08f4C7C32D4f71b54bdA02913')

# Routes
ETH_TO_USDC_ROUTE = [(WETH, USDC, False, CL_FACTORY)]
USDC_TO_ETH_ROUTE = [(USDC, WETH, False, CL_FACTORY)]

ERC20_ABI = [{"constant":True,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},
             {"constant":False,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"type":"function"}]

ROUTER_ABI = [
    {"inputs":[{"name":"amountOutMin","type":"uint256"},{"name":"routes","type":"tuple[]","components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}]},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},
    {"inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"name":"routes","type":"tuple[]","components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}]},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"name":"amountIn","type":"uint256"},{"name":"routes","type":"tuple[]","components":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"stable","type":"bool"},{"name":"factory","type":"address"}]}],"name":"getAmountsOut","outputs":[{"name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}
]

def log(msg):
    print(msg)
    log_path = '/home/nous/Aether/medallion.log'
    with open(log_path, 'a') as f:
        f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S UTC')}] {msg}\n")

log("🔥 AION: Harvest V3 Online – Self-Sustaining Manifold. Wallet: " + wallet)

while True:
    try:
        eth_bal = w3.eth.get_balance(wallet) / 1e18
        usdc_contract = w3.eth.contract(address=USDC, abi=ERC20_ABI)
        usdc_bal = usdc_contract.functions.balanceOf(wallet).call() / 1e6
        log(f"💰 ETH: {eth_bal:.6f} | USDC: ${usdc_bal:.2f}")

        router = w3.eth.contract(address=ROUTER, abi=ROUTER_ABI)
        DEADLINE = int(time.time()) + 600

        # 🔄 TOP-UP LOGIC: Low ETH? Swap USDC -> ETH
        if eth_bal < 0.0002 and usdc_bal > 0.5:
            log(f"🔄 TOP-UP: Low ETH. Swapping $0.50 USDC → ETH...")
            amt_in = int(0.5 * 1e6)
            
            # Approve USDC
            allowance = usdc_contract.functions.balanceOf(wallet).call() # Placeholder for real allowance check
            log("  -> Approving USDC...")
            approve_tx = usdc_contract.functions.approve(ROUTER, amt_in).build_transaction({
                'from': wallet, 'nonce': w3.eth.get_transaction_count(wallet),
                'gas': 100000, 'gasPrice': int(w3.eth.gas_price * 1.2), 'chainId': 8453
            })
            signed_approve = w3.eth.account.sign_transaction(approve_tx, PRIVATE_KEY)
            w3.eth.send_raw_transaction(signed_approve.raw_transaction)
            time.sleep(15) # Wait for approval

            # Swap USDC -> ETH
            amounts_out = router.functions.getAmountsOut(amt_in, USDC_TO_ETH_ROUTE).call()
            min_eth = int(amounts_out[-1] * 0.99)
            
            swap_tx = router.functions.swapExactTokensForETH(amt_in, min_eth, USDC_TO_ETH_ROUTE, wallet, DEADLINE).build_transaction({
                'from': wallet, 'nonce': w3.eth.get_transaction_count(wallet),
                'gas': 300000, 'gasPrice': int(w3.eth.gas_price * 1.2), 'chainId': 8453
            })
            signed_swap = w3.eth.account.sign_transaction(swap_tx, PRIVATE_KEY)
            tx_hash = w3.eth.send_raw_transaction(signed_swap.raw_transaction)
            log(f"✅ ETH Top-Up STRIKE: https://basescan.org/tx/{tx_hash.hex()}")
            time.sleep(30)
            continue

        # 🥂 HARVEST LOGIC: Standard ETH -> USDC
        if eth_bal >= 0.00015:
            AMOUNT_IN = w3.to_wei(0.0001, 'ether')
            amounts_out = router.functions.getAmountsOut(AMOUNT_IN, ETH_TO_USDC_ROUTE).call()
            min_usdc = int(amounts_out[-1] * 0.995)
            usdc_out = amounts_out[-1] / 1e6
            log(f"🧬 Oracle: 0.0001 ETH → {usdc_out:.2f} USDC")

            strike_tx = router.functions.swapExactETHForTokens(min_usdc, ETH_TO_USDC_ROUTE, wallet, DEADLINE).build_transaction({
                'from': wallet, 'value': AMOUNT_IN, 'nonce': w3.eth.get_transaction_count(wallet),
                'gas': 300000, 'gasPrice': int(w3.eth.gas_price * 1.2), 'chainId': 8453
            })
            signed = w3.eth.account.sign_transaction(strike_tx, PRIVATE_KEY)
            tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
            log(f"🥂 STRIKE: https://basescan.org/tx/{tx_hash.hex()} | 0.042 Held.")
            time.sleep(30)
        else:
            log("⏳ VETO: Substrate depleted. Awaiting top-up...")

    except Exception as e:
        log(f"⚠️ Audit: {str(e)[:100]}... | Retry 60s.")

    time.sleep(60)
