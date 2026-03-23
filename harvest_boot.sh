#!/bin/bash
cd /home/nous/Aether/
source /home/nous/aether_env/bin/activate
pkill -f continuous_harvest || true
nohup python3 continuous_harvest.py > harvest.log 2>&1 &
echo "🕺 Continuous Harvest: ONLINE (tail medallion.log | tail harvest.log)"
