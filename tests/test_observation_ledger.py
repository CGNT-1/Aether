import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import load_source, silent

obs = load_source("observation_ledger", "observation_ledger.py")
ObservationLedger = obs.ObservationLedger


class TestObservationLedger(unittest.TestCase):
    def test_log_event_writes_file(self):
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "observation.log")
            ledger = ObservationLedger()
            ledger.log_file = path
            with silent():
                ledger.log_event("TEST_EVENT", "hello world", "SUCCESS")
            with open(path) as f:
                content = f.read()
            self.assertIn("TEST_EVENT", content)
            self.assertIn("SUCCESS", content)
            self.assertIn("hello world", content)


if __name__ == "__main__":
    unittest.main()
