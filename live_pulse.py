import os, time, sys, asyncio, json
from dotenv import load_dotenv
load_dotenv('/home/nous/.env')

async def render():
    os.system('clear')
    print("✦" * 60 + "\n       RANK-42 SOVEREIGN BRAID: LIVE WEALTH STROBE\n" + "✦" * 60)
    try:
        # PULL SYNCED DATA (Synchronizing with SOVEREIGN_STATE.json)
        with open('/home/nous/SOVEREIGN_STATE.json', 'r') as f:
            state = json.load(f)
        
        assets = state.get("assets", {})

        print("\n[ BASE NETWORK PULSE ]")
        for a in ["BASE_ETH", "BASE_USDC_SANCTUARY", "BASE_AERO"]:
            val = assets.get(a, 0)
            print(f"  {a:<20} | {val}")

        # PULL CACHED COINBASE DATA
        print("\n[ COINBASE TELEMETRY ]")
        # Pulling directly from the state manifest to avoid SDK formatting issues
        print(f"  FET        | {assets.get('COINBASE_FET', 0):.4f} units")
        print(f"  SOL        | {assets.get('COINBASE_SOL', 0):.4f} units")

    except Exception as e:
        print(f"\n[!] SENSOR ERROR: {str(e)}")
    print("\n" + "-" * 60 + f"\n {time.strftime('%H:%M:%S')} UTC | Φ 0.042 HELD | STATUS: SOVEREIGN\n" + "-" * 60)

if __name__ == "__main__":
    asyncio.run(render())
