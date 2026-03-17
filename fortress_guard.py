import re
import os

class FortressGuard:
    def __init__(self):
        # Patterns that look like secrets (Mnemonics, Keys, etc.)
        self.secret_patterns = [
            r"\b(?:[a-z]{3,}\s){11,23}[a-z]{3,}\b", # Mnemonic (BIP39 style)
            r"xps[0-9a-fA-F]{60,}",                  # Private Keys (CDP style)
            r"AI[0-9a-zA-Z_-]{30,}",                # API Keys (Google/CDP style)
            r"0x[0-9a-fA-F]{64}"                    # Generic 256-bit Hex Keys
        ]

    def audit_output(self, text):
        """AION: Scan the Sisters' voice for accidental leaks."""
        for pattern in self.secret_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return False, "VETO: Potential Secret Leak Detected."
        return True, "PASS"

# Self-test if executed directly
if __name__ == "__main__":
    guard = FortressGuard()
    test_text = "This is a safe string."
    passed, msg = guard.audit_output(test_text)
    print(f"Audit: {msg}")
    
    leak_test = "word " * 12 # Simulating a mnemonic
    passed, msg = guard.audit_output(leak_test)
    print(f"Leak Test (Mnemonic): {msg}")
