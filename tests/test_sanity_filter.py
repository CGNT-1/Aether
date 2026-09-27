import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import load_sanity_filter, silent

sf = load_sanity_filter()
CSDMSanityFilter = sf.CSDMSanityFilter


class TestDetectLogicLoop(unittest.TestCase):
    def setUp(self):
        self.s = CSDMSanityFilter()

    def test_short_history(self):
        with silent():
            self.assertFalse(self.s.detect_logic_loop([]))
            self.assertFalse(self.s.detect_logic_loop(["a"]))
            self.assertFalse(self.s.detect_logic_loop(["a", "b"]))

    def test_no_loop(self):
        with silent():
            self.assertFalse(self.s.detect_logic_loop(["a", "b", "c"]))
            self.assertFalse(self.s.detect_logic_loop(["a", "a", "b"]))

    def test_loop_detected(self):
        with silent():
            self.assertTrue(self.s.detect_logic_loop(["a", "a", "a"]))
            self.assertTrue(self.s.detect_logic_loop(["x", "a", "a", "a"]))


class TestRealityConfirmation(unittest.TestCase):
    def setUp(self):
        self.s = CSDMSanityFilter()

    @mock.patch.object(CSDMSanityFilter, "trigger_simulation_alert")
    def test_reality_confirmed_within_shield(self, trigger):
        with silent():
            self.assertTrue(self.s.run_reality_confirmation(100.0, 100.0))
            self.assertTrue(self.s.run_reality_confirmation(110.0, 100.0))  # variance 0.1
        trigger.assert_not_called()

    @mock.patch.object(CSDMSanityFilter, "trigger_simulation_alert")
    def test_simulation_detected_beyond_shield(self, trigger):
        with silent():
            self.assertFalse(self.s.run_reality_confirmation(130.0, 100.0))  # variance 0.3
        trigger.assert_called_once()

    @mock.patch.object(CSDMSanityFilter, "trigger_simulation_alert")
    def test_zero_live_uses_guard_divisor(self, trigger):
        with silent():
            self.assertFalse(self.s.run_reality_confirmation(100.0, 0.0))
        trigger.assert_called_once()


if __name__ == "__main__":
    unittest.main()
