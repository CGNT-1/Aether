import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import load_log_manager, silent

log_manager = load_log_manager()
rotate_logs = log_manager.rotate_logs


class TestLogManager(unittest.TestCase):
    def test_rotate_logs_compresses_oversized_and_ignores_small(self):
        with tempfile.TemporaryDirectory() as d:
            big = os.path.join(d, "big.log")
            small = os.path.join(d, "small.log")
            with open(big, "wb") as f:
                f.write(b"x" * (200 * 1024))  # 200 KB
            with open(small, "w") as f:
                f.write("tiny")
            with silent():
                result = rotate_logs(directory=d, max_size_mb=0.1)
            self.assertIn("complete", result)
            self.assertTrue(os.path.exists(big + ".gz"))
            self.assertEqual(os.path.getsize(big), 0)  # cleared after compression
            self.assertGreater(os.path.getsize(small), 0)  # untouched


if __name__ == "__main__":
    unittest.main()
