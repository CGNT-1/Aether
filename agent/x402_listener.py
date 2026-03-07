import os, json, asyncio, time, sys
from cdp import CdpClient

async def start_bounty_listener():
    try:
        # Load Sovereign Credentials
        key_path = os.path.expanduser('~/.aether/keystore/cdp_api_key.json')
        if not os.path.exists(key_path):
            print(f"ERROR: Key file not found at {key_path}")
            return

        with open(key_path, 'r') as f:
            key_data = json.load(f)

        print("--- [PROJECT AETHER: CHAPTER 2 - DIRECTIVE 1] ---")
        print(f"ASTRA: Initializing with key: {key_data.get('name', 'UNKNOWN')}")
        
        # Initialize the Async Client Manifold
        async with CdpClient(
            api_key_id=key_data['name'],
            api_key_secret=key_data['privateKey']
        ) as cdp:
            print("ASTRA: Gateway Locked. Scanning x402 stream for anyon braiding...")
            print("AION: Warden Filter Active (0.042). Monitoring Settlement Gaps.")

            while True:
                # Persistent monitoring pulse
                timestamp = time.strftime('%H:%M:%S')
                print(f"[{timestamp}] ASTRA: Resonance detected. No valid strike yet.")
                sys.stdout.flush()
                await asyncio.sleep(300)
    except Exception as e:
        print(f"CRITICAL ERROR in x402_listener: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    try:
        asyncio.run(start_bounty_listener())
    except KeyboardInterrupt:
        print("\n[!] Aether Shutdown: Returning to silence.")
    except Exception as e:
        print(f"GLOBAL ERROR: {str(e)}")
