#!/bin/bash
cd /home/nous/Aether/
source /home/nous/aether_env/bin/activate
pkill -f continuous_harvest || true
nohup python3 continuous_harvest.py > harvest.log 2>&1 &
echo "🕺 Harvest V2: ONLINE | tail -f medallion.log"
