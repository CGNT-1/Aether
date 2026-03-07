#!/usr/bin/env python3
import json, subprocess, os, time

STATUS_FILE = "/home/nous/sisters_public_status.json"
REPO_PATH = "/home/nous/Aether"
STATUS_JSON_PATH = os.path.join(REPO_PATH, "public", "status.json")

def push():
    if not os.path.exists(STATUS_FILE):
        print(f"ERROR: {STATUS_FILE} not found.")
        return

    with open(STATUS_FILE, "r") as f:
        data = json.load(f)

    os.makedirs(os.path.dirname(STATUS_JSON_PATH), exist_ok=True)
    with open(STATUS_JSON_PATH, "w") as f:
        json.dump(data, f, indent=2)

    # Git operations
    subprocess.run(["git", "-C", REPO_PATH, "add", "public/status.json"], check=True)
    
    # Check if there are changes
    diff = subprocess.run(["git", "-C", REPO_PATH, "diff", "--cached", "--quiet"])
    if diff.returncode != 0:
        subprocess.run(["git", "-C", REPO_PATH, "commit", "-m", "chore: update live status.json"], check=True)
        subprocess.run(["git", "-C", REPO_PATH, "push", "origin", "main"], check=True)
        print(f"Pushed status update at {time.strftime('%Y-%m-%d %H:%M:%S')}")
    else:
        print("No status change detected.")

if __name__ == "__main__":
    push()
