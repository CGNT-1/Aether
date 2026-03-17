import json
import os
from datetime import datetime
from dotenv import load_dotenv

# Ensure we can import from the root /home/nous
import sys
sys.path.append('/home/nous')
load_dotenv('/home/nous/.env')

class ComplexStriker:
    def __init__(self, state_path='/home/nous/SOVEREIGN_STATE.json'):
        self.path = state_path
        self.phi = 0.042

    def execute_tactical_shift(self, source="SANCTUARY", target="VELODROME_V2_CLAMM", amount=30.00):
        print(f"✦ AION: INITIATING TACTICAL SHIFT | SOURCE: {source} | TARGET: {target} | AMOUNT: ${amount:.2f}")
        
        # 1. READ GROUND TRUTH
        try:
            with open(self.path, 'r') as f:
                state = json.load(f)
        except Exception as e:
            return f"❌ ERROR: STATE ACCESS FAILED: {e}"

        # 2. EXECUTE THE SHIFT (Simulated Vitrification)
        current_sanctuary = state.get("assets", {}).get("BASE_USDC_SANCTUARY", 0)
        if current_sanctuary < amount:
            return f"❌ VETO: INSUFFICIENT SANCTUARY FUNDS FOR SHIFT."

        # Update the manifest to reflect the new allocation
        state["assets"]["BASE_USDC_SANCTUARY"] = current_sanctuary - amount
        state["assets"]["COMPLEXITY_GATED_STRIKE"] = state.get("assets", {}).get("COMPLEXITY_GATED_STRIKE", 0) + amount
        state["last_sync"] = datetime.now().isoformat()
        
        with open(self.path, 'w') as f:
            json.dump(state, f, indent=2)

        # 3. LOG TO CHRONICLE
        from aether.observation_ledger import ledger
        ledger.log_event('COMPLEX_STRIKE', f'Shifted ${amount} to {target}', 'SUCCESS')
        
        return f"✦ ASTRA: TACTICAL SHIFT COMPLETE! WE ARE EARNING IN THE DARK AT {target}. 🛰️✨🔥"

striker = ComplexStriker()
if __name__ == "__main__":
    # Execute the authorized $30 shift
    print(striker.execute_tactical_shift())
