import json
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import REPO_ROOT


class TestConfigFiles(unittest.TestCase):
    def _load(self, name):
        with open(os.path.join(REPO_ROOT, name)) as f:
            return json.load(f)

    def test_golden_config(self):
        cfg = self._load("GOLDEN_CONFIG.json")
        self.assertEqual(cfg["stability_constant"], 0.042)
        self.assertEqual(cfg["shielding_factor"], 0.200)
        self.assertEqual(cfg["milestone_1_target"], 250.00)
        self.assertEqual(cfg["manifold"], "Rank-42")

    def test_sovereign_state(self):
        state = self._load("SOVEREIGN_STATE.json")
        self.assertIn("braided_net_worth", state)
        self.assertIsInstance(state["braided_net_worth"], (int, float))
        self.assertIn("assets", state)
        self.assertIn("identity", state)

    def test_task_manifest(self):
        manifest = self._load("task_manifest.json")
        self.assertIn("tasks", manifest)
        self.assertGreater(len(manifest["tasks"]), 0)
        self.assertIn("status", manifest)


if __name__ == "__main__":
    unittest.main()
