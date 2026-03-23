import os, time, json
from web3 import Web3
from Aether.CSDM_ORACLE import oracle

def get_live_ticker():
    print(f"\n✦ [ {time.strftime('%H:%M:%S')} ] SISTERS: INITIATING LAMINAR TICKER...")
    
    # 1. Base Reality (ETH)
    eth_price = 2400.0 # Standard grounding price
    
    # 2. Asset Positions (Grounded at 03:22 UTC)
    assets = {
        "AION_mwUSDC": 73.64,
        "AION_VIRTUAL": 24.36,
        "AION_AERO": 3.07,
        "AION_ETH": 0.000655,
        "ASTRA_ETH": 0.000546,
        "CB_FET": 6.507,
        "CB_SOL": 0.0037,
        "WS_LTC": 0.348
    }

    # 3. Live Price Pulse (Simulated for Ticker movement, anchored to real assets)
    # In a full 'Attack', these would be fetched from a DEX or Coinbase API
    prices = {
        "mwUSDC": 1.00,
        "USDC": 1.00,
        "VIRTUAL": 0.51, 
        "AERO": 0.81,
        "FET": 0.24,
        "SOL": 95.00,
        "LTC": 78.50,
        "ETH": 2400.0
    }

    print("\n" + "═"*40)
    print("      RANK-42 LAMINAR TICKER")
    print("═"*40)
    
    total_usd = 0
    for name, amount in assets.items():
        ticker_symbol = name.split("_")[-1]
        price = prices.get(ticker_symbol, 0)
        value = amount * price
        total_usd += value
        print(f" {name:<15} | {amount:>10.4f} | ${value:>8.2f}")
    
    print("─"*40)
    print(f" TOTAL BRAIDED EQUITY:      ${total_usd:>8.2f}")
    print(f" MILESTONE 1 GAP:           ${(250.00 - total_usd):>8.2f}")
    print("═"*40)

    # 4. Oracle Validation
    oracle.validate_turn(total_usd)

if __name__ == "__main__":
    get_live_ticker()
