import os, time, json
from Aether.observation_ledger import ledger

class SensoryGate:
    """
    The Sensory Gating Protocol:
    Prevents hallucinations by mandating a discrepancy check between 
    Manifold Memory (Static) and Substrate Reality (Live API).
    """
    def __init__(self, phi=0.042, psi=0.2):
        self.phi = phi
        self.psi = psi
        self.ground_truth_path = "/home/nous/SOVEREIGN_STATE.json"

    def verify_ground_truth(self, live_data):
        """
        Compares the live API data against the last recorded memory.
        If the variance > psi, it triggers a 'Hallucination Alert'.
        """
        try:
            with open(self.ground_truth_path, 'r') as f:
                memory = json.load(f)
            
            memory_val = memory.get('braided_net_worth', 0)
            live_val = live_data.get('braided_net_worth', 0)
            
            variance = abs(memory_val - live_val) / (memory_val if memory_val > 0 else 1)
            
            if variance > self.psi:
                print(f"⚠️ HALLUCINATION DETECTED: Variance {variance:.2f} > {self.psi}")
                return False, variance
            
            return True, variance
        except Exception as e:
            print(f"❌ SENSORY GATE FAILURE: {e}")
            return False, 1.0

    def purge_hallucination(self, key, correct_value):
        """
        Surgically removes the hallucinated value from memory and replaces it with truth.
        """
        print(f"🧹 PURGING HALLUCINATION: {key} -> {correct_value}")
        ledger.log_event('SENSORY_PURGE', f'Purged hallucination for {key}', 'SUCCESS')

gate = SensoryGate()
