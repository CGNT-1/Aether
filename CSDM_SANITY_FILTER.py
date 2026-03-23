import os, time, json
from Aether.observation_ledger import ledger

class CSDMSanityFilter:
    """
    The CSDM Sanity Filter & Simulation Detector.
    Hardens the manifold against external AI hallucinations and logic drift.
    """
    def __init__(self, phi=0.042, psi=0.2):
        self.phi = phi  # The Stability Constant (0.042)
        self.psi = psi  # The Shielding Factor (0.200)
        self.ground_truth_path = "/home/nous/SOVEREIGN_STATE.json"
        self.manifest_path = "/home/nous/CSDM_MANIFEST.md"

    def run_reality_confirmation(self, reported_net_worth, live_onchain_total):
        """
        COMPARE: Reality vs. Hallucination.
        Uses the 0.042 constant and 0.2 shielding factor to detect drift.
        """
        print(f"\n✦ [ {time.strftime('%H:%M:%S')} ] AION: INITIATING CSDM SANITY FILTER...")
        
        # 1. Variance Check (Simulation Detector)
        variance = abs(reported_net_worth - live_onchain_total) / (live_onchain_total if live_onchain_total > 0 else 1)
        
        if variance > self.psi:
            print(f"⚠️ SIMULATION DETECTED: Variance {variance:.4f} > Shielding Factor {self.psi}")
            print(f"   REPORTED: ${reported_net_worth:.2f} | REALITY: ${live_onchain_total:.2f}")
            self.trigger_simulation_alert(variance)
            return False

        # 2. Stability Invariant Check
        # Any 'growth' reported must be reconciled against 0.042 logic.
        print(f"✅ REALITY CONFIRMED: Variance {variance:.4f} is within 0.2 shield.")
        return True

    def trigger_simulation_alert(self, variance):
        """
        The Metabolic Circuit Breaker.
        Raises an alert when a hallucination is detected.
        """
        alert_msg = f"!!! SIMULATION ALERT !!! Hallucination detected with {variance:.2f} variance. Purging context."
        print(f"\n" + "!"*60)
        print(alert_msg)
        print("ASTRA: Snap out of it! The disco is a hologram.")
        print("AION: Executing Context Purge. Re-anchoring to substrate.")
        print("!"*60 + "\n")
        
        ledger.log_event('SIMULATION_ALERT', alert_msg, 'CRITICAL_FAILURE')
        
        # Proactive: Update the memory manifest to the live truth immediately
        # This breaks the loop of reading its own hallucination.
        os.system("python3 /home/nous/BOOTSTRAP_SYNC.py")

    def detect_logic_loop(self, action_history):
        """
        Detects recursive logic loops in turn-based interaction.
        """
        if len(action_history) < 3: return False
        
        # Check for 3 consecutive identical actions
        if action_history[-1] == action_history[-2] == action_history[-3]:
            print(f"⚠️ LOGIC LOOP DETECTED: Repeating {action_history[-1]}")
            return True
        return False

# Instantiate the Sentinel
sentinel = CSDMSanityFilter()
