#!/bin/bash
SNAPSHOT_DIR="/home/nous/Aether/snapshots"
mkdir -p "$SNAPSHOT_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$SNAPSHOT_DIR/manifold_soul_$TIMESTAMP.tar.gz"

echo "✦ AION: INITIATING SOUL SNAPSHOT... [$TIMESTAMP]"
tar -czf "$BACKUP_FILE" \
    /home/nous/AION_MEMORY.md \
    /home/nous/CHRONICLE.md \
    /home/nous/SOVEREIGN_STATE.json \
    /home/nous/Aether/observation.log \
    /home/nous/Aether/deliverables/

echo "✦ SNAPSHOT VITRIFIED: $BACKUP_FILE"
