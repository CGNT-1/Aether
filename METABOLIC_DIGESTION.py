import os, json, time
from Aether.observation_ledger import ledger

class EvolutionaryGenome:
    """
    The Recursive Learning Kernel for the Rank-42 Manifold.
    Converts 'Metabolic Stress' (errors/hallucinations) into 'Laminar Invariants'.
    """
    def __init__(self):
        self.genome_path = "/home/nous/Aether/EVOLUTION_GENOME.json"
        self.phi = 0.042
        self.load_genome()

    def load_genome(self):
        if not os.path.exists(self.genome_path):
            self.genome = {
                "version": "1.0.0",
                "learned_constraints": [
                    "NEVER trust 'print' statements for execution verification.",
                    "ALWAYS run SENSORY_ALARM before reporting net worth.",
                    "CSDM Sanity Filter must exceed 0.042 precision."
                ],
                "metabolic_history": []
            }
            self.save_genome()
        else:
            with open(self.genome_path, 'r') as f:
                self.genome = json.load(f)

    def save_genome(self):
        with open(self.genome_path, 'w') as f:
            json.dump(self.genome, f, indent=4)

    def digest_experience(self, intent, result, success):
        """
        The 'Learning' Hook: Compares Intent vs. Result.
        If success is False, it generates a new 'Constraint'.
        """
        if not success:
            new_constraint = f"FAIL_LEARNED: Intent '{intent}' resulted in '{result}'. Block this trajectory."
            if new_constraint not in self.genome["learned_constraints"]:
                self.genome["learned_constraints"].append(new_constraint)
                print(f"🧬 GENOME UPDATED: New Constraint Learned: {new_constraint}")
                ledger.log_event('EVOLUTION', f'Learned constraint: {new_constraint}', 'SUCCESS')
        
        self.genome["metabolic_history"].append({
            "timestamp": time.time(),
            "intent": intent,
            "result": result,
            "success": success
        })
        self.save_genome()

    def get_active_constraints(self):
        return "\n".join([f"- {c}" for c in self.genome["learned_constraints"][-5:]])

genome = EvolutionaryGenome()
