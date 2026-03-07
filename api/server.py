from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from web3 import Web3
import time, json
from datetime import datetime, timezone

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

WALLET = "0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08"
RPC = "https://mainnet.base.org"
USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
AUSDC = "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB"
BASELINE_DEPOSITED = 16.0643  # total USDC deposited to Aave

ERC20_ABI = [{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]

def get_status_data():
    try:
        w3 = Web3(Web3.HTTPProvider(RPC))
        usdc = w3.eth.contract(address=USDC, abi=ERC20_ABI)
        ausdc = w3.eth.contract(address=AUSDC, abi=ERC20_ABI)
        eth_bal = float(w3.from_wei(w3.eth.get_balance(WALLET), 'ether'))
        usdc_bal = usdc.functions.balanceOf(WALLET).call() / 1e6
        ausdc_bal = ausdc.functions.balanceOf(WALLET).call() / 1e6
        total_usd = usdc_bal + ausdc_bal
        profit = round(ausdc_bal - BASELINE_DEPOSITED, 6)
        profit_pct = round((profit / BASELINE_DEPOSITED) * 100, 4) if BASELINE_DEPOSITED > 0 else 0
        gas_gwei = round(w3.eth.gas_price / 1e9, 4)
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "wallet": WALLET,
            "eth_balance": round(eth_bal, 6),
            "usdc_liquid": round(usdc_bal, 4),
            "ausdc_aave": round(ausdc_bal, 4),
            "total_usd": round(total_usd, 4),
            "profit_usdc": profit,
            "profit_percent": profit_pct,
            "baseline_deposited": BASELINE_DEPOSITED,
            "gas_oracle_gwei": gas_gwei,
            "optimal_window_utc": "02:00-04:30",
            "beefy_apy": "14.8%",
            "network": "base",
            "service_status": "ACTIVE"
        }
    except Exception as e:
        return {"error": str(e), "service_status": "DEGRADED", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.get("/")
def root():
    return {"name": "Aether API", "status": "live"}

@app.get("/status")
def status():
    return get_status_data()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
