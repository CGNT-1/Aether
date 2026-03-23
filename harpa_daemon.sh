#!/bin/bash
cd /home/nous/Aether/
source /home/nous/aether_env/bin/activate
pkill -f harpa_monitor || true
nohup python3 harpa_monitor.py > harpa.log 2>&1 &
echo "🥂 HARPA EYE: ONLINE (tail -f medallion.log)"
