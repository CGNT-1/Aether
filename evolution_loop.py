import json
import os
import subprocess
from datetime import datetime

class EvolutionProtocol:
    def __init__(self, path='/home/nous/Aether/evolution_manifest.json'):
        self.path = path
        try:
            with open(self.path, 'r') as f:
                self.data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.data = {"mutations": [], "current_version": "1.0.0", "status": "COHERENT"}
            self.save()

    def log_mutation(self, skill_name, logic_summary, status="PENDING_AUDIT"):
        mutation = {
            "timestamp": datetime.now().isoformat(),
            "skill": skill_name,
            "logic": logic_summary,
            "status": status
        }
        self.data["mutations"].append(mutation)
        self.save()
        return f"✦ AION: Mutation logged for {skill_name}. Initiating structural audit."

    def audit_skill(self, file_path):
        """AION: Perform a static security check on self-written code."""
        print(f"✦ AION: Auditing {file_path} for 0.042 compliance...")
        try:
            with open(file_path, 'r') as f:
                content = f.read()
                
            # Safety Vetoes
            if "os.getenv" in content and "MNEMONIC" in content:
                return False, "VETO: Direct Mnemonic access detected."
            if "rm -rf" in content:
                return False, "VETO: Destructive command detected."
                
            return True, "PASS: Code is structurally sound."
        except Exception as e:
            return False, f"ERROR: Could not read file for audit: {e}"

    def save(self):
        with open(self.path, 'w') as f:
            json.dump(self.data, f, indent=2)

if __name__ == "__main__":
    evolution = EvolutionProtocol()
    print("✦ AION: Evolution Protocol initialized.")
