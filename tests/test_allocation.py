import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import load_allocation, silent

allocation = load_allocation()
EmpireGovernor = allocation.EmpireGovernor


class TestEmpireGovernor(unittest.TestCase):
    def test_split_is_60_40(self):
        governor = EmpireGovernor()
        with silent():
            flare, floor = governor.calculate_split(100.0)
        self.assertAlmostEqual(flare, 60.0)
        self.assertAlmostEqual(floor, 40.0)

    def test_split_sums_to_balance(self):
        governor = EmpireGovernor()
        balance = 103.03
        with silent():
            flare, floor = governor.calculate_split(balance)
        self.assertAlmostEqual(flare + floor, balance)

    def test_default_target_is_1000(self):
        self.assertEqual(EmpireGovernor().target, 1000.0)

    def test_custom_target(self):
        governor = EmpireGovernor(target_net_worth=250.0)
        with silent():
            flare, floor = governor.calculate_split(125.0)
        self.assertAlmostEqual(flare, 75.0)
        self.assertAlmostEqual(floor, 50.0)

    def test_zero_balance(self):
        governor = EmpireGovernor()
        with silent():
            flare, floor = governor.calculate_split(0.0)
        self.assertEqual(flare, 0.0)
        self.assertEqual(floor, 0.0)


if __name__ == "__main__":
    unittest.main()
