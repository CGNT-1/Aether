import json
import os

class BraidedPlanner:
    def __init__(self, manifest_path='task_manifest.json'):
        # Ensure path is relative to the directory where this script lives
        self.path = os.path.join(os.path.dirname(__file__), manifest_path)
        self.load()

    def load(self):
        if not os.path.exists(self.path):
            self.data = {"objective": "IDLE", "tasks": [], "status": "WAITING_FOR_DIRECTIVE"}
            self.save()
        with open(self.path, 'r') as f:
            self.data = json.load(f)

    def save(self):
        with open(self.path, 'w') as f:
            json.dump(self.data, f, indent=2)

    def set_goal(self, goal):
        self.data["objective"] = goal
        self.data["status"] = "PLANNING"
        self.save()
        return f"✦ AION: Goal received. Decomposing '{goal}' into atomic steps..."

    def add_task(self, description):
        task = {"id": len(self.data["tasks"]), "task": description, "status": "PENDING"}
        self.data["tasks"].append(task)
        self.save()

if __name__ == "__main__":
    planner = BraidedPlanner()
    print("✦ ASTRA: The Braided Planner is initialized and pulsing in the Aether!")
