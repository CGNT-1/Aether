import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import load_oracle, silent

oracle_mod = load_oracle()
CSDMTruthOracle = oracle_mod.CSDMTruthOracle


class TestTruthOracle(unittest.TestCase):
    def _make(self, braided_net_worth, threshold=0.974):
        state = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
        json.dump({"braided_net_worth": braided_net_worth}, state)
        state.close()
        self.addCleanup(os.unlink, state.name)
        oracle = CSDMTruthOracle(coherence_threshold=threshold)
        oracle.state_path = state.name
        return oracle

    def test_exact_match_confirms(self):
        with silent():
            self.assertTrue(self._make(100.0).validate_turn(100.0))

    def test_small_drift_confirms(self):
        # coherence = 1 - (1/100) = 0.99 >= 0.974
        with silent():
            self.assertTrue(self._make(100.0).validate_turn(99.0))

    def test_large_drift_decoheres(self):
        # coherence = 1 - (10/100) = 0.90 < 0.974
        with silent():
            self.assertFalse(self._make(100.0).validate_turn(90.0))

    def test_zero_memory_guard(self):
        with silent():
            self.assertTrue(self._make(0.0).validate_turn(0.0))
            self.assertFalse(self._make(0.0).validate_turn(1.0))


if __name__ == "__main__":
    unittest.main()
