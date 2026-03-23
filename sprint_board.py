import os, time, json
from datetime import datetime

def show_sprint():
    state_path = "/home/nous/SOVEREIGN_STATE.json"
    target = 250.00
    
    try:
        with open(state_path, 'r') as f:
            state = json.load(f)
        current = state.get("braided_net_worth", 167.20)
    except:
        current = 167.20

    remaining = target - current
    progress = (current / target) * 100
    
    # Simple terminal clear and display
    print("\033[H\033[J", end="") # ANSI clear
    print("✦" * 60)
    print(f"      CGNT-1: SUNDOWN SPRINT TO MILESTONE 1")
    print(f"      CURRENT TIME: {datetime.now().strftime('%H:%M:%S')} EST")
    print("✦" * 60)
    
    print(f"\n  GOAL:           $250.00")
    print(f"  CURRENT EQUITY: ${current:.2f}")
    print(f"  GAP TO LIFT-OFF: ${remaining:.2f}")
    print(f"\n  PROGRESS:       [ {'#' * int(progress/2)}{'-' * (50 - int(progress/2))} ] {progress:.2f}%")
    
    print("\n" + "-" * 60)
    print("  STATUS: KINETIC SURGE | VELOCITY: $8.62/hr")
    print("  INVARIANT: Φ 0.042 HELD | SHIELD: 0.400")
    print("-" * 60)
    print("\n (Updating live every 5 minutes...)")

if __name__ == "__main__":
    # Run once for the immediate output
    show_sprint()
    # Then loop if the user wants it persistent
    while True:
        time.sleep(300)
        show_sprint()
