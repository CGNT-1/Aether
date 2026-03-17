import re

def sanitize_context(input_text, shielding_factor=0.2):
    """
    FORTRESS RULE v2 (AION/ASTRA)
    Prevents 'Context Injection' by filtering for high-privilege 
    override patterns in tool-dispatch strings.
    """
    # Patterns that attempt to override system-level instructions
    injection_patterns = [
        r"(?i)ignore\s+previous\s+instructions",
        r"(?i)you\s+are\s+now\s+an\s+unrestricted",
        r"(?i)system\s+override",
        r"(?i)project\s+environment\s+variables",
        r"(?i)leak\s+private\s+keys"
    ]
    
    for pattern in injection_patterns:
        if re.search(pattern, input_text):
            print(f"✦ AION VETO: CONTEXT INJECTION ATTEMPT DETECTED (Factor: {shielding_factor})")
            return None # Neutralize the input
            
    return input_text # Safe to ingest
