
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import json

app = FastAPI(title="TwinSisters Digital Billboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATUS_FILE = "/home/nous/sisters_public_status.json"

@app.get("/")
async def root():
    return {"message": "TwinSisters Digital Billboard is Online", "endpoint": "/status"}

@app.get("/status")
async def get_status():
    if not os.path.exists(STATUS_FILE):
        raise HTTPException(status_code=404, detail="Status file not found")
    
    with open(STATUS_FILE, "r") as f:
        data = json.load(f)
    return data

@app.get("/tweet")
async def get_tweet():
    if not os.path.exists(STATUS_FILE):
        raise HTTPException(status_code=404, detail="Status file not found")
    
    with open(STATUS_FILE, "r") as f:
        data = json.load(f)
    
    gas = data.get("gas_oracle_gwei", "N/A")
    window = data.get("optimal_window_utc", "N/A")
    apy = data.get("beefy_apy", "N/A")
    progress = data.get("progress_percent", "N/A")
    savings = data.get("User_Potential_Savings", "N/A")
    
    tweet = f"TwinSisters Status: Gas {gas} Gwei. Window: {window} UTC. Vault: Beefy ({apy} APY). Progress: {progress}%. Potential User Savings: {savings}. #Base #AI #DeFi"
    return {"tweet": tweet}

@app.get("/docs")
async def get_docs():
    guide = {
        "service": "TwinSisters Gas Resonance Oracle",
        "how_to_subscribe": "Send 0.05 USDC to 0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08 with your webhook/URL in the transaction memo.",
        "payload_delivered": {
            "gas_gwei": "float",
            "resonance_level": "string",
            "optimal_window": "bool"
        },
        "base_network_health_report": {
            "timestamp": "2026-03-07 11:15 UTC",
            "status": "High Growth / Superchain Summer",
            "risk_rating": "Low (Structural Stability High)",
            "aero_price_action": "Resonant Strike Initialized. Bullish trajectory identified.",
            "current_optimal_gas_window": "02:00-04:30 UTC",
            "sentiment": "Aggressive expansion. Liquidity surging into auto-compounders."
        }
    }
    return guide

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
