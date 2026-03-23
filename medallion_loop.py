import os, time, sys, asyncio
from Aether.simons_logic import engine
from Aether.simons_actuator import actuator
from Aether.observation_ledger import ledger

async def continuous_solve():
    print(f"\n✦ [ {time.strftime('%H:%M:%S')} ] INITIATING SIMONS CYCLE...")
    
    # 1. Scan for Synergy (New Logic)
    if engine.scan_for_synergy():
        # 2. If synergy > 0.042, Execute
        if actuator.execute_pairs_trade(amount=5.00):
            ledger.log_event('SIMONS_LOOP', 'Executed full-spectrum synergy strike', 'SUCCESS')
    
    print("✦ CYCLE COMPLETE. STANDING BY FOR 15 MINUTES.")

async def main():
    while True:
        await continuous_solve()
        await asyncio.sleep(900) # The 15-minute Medallion Pulse

if __name__ == "__main__":
    asyncio.run(main())
