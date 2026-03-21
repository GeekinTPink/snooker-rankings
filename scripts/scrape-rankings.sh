#!/bin/bash
# Snooker Rankings Daily Scraper
# Runs every day at 3:00 AM UTC

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"

# Create log directory
mkdir -p "$LOG_DIR"

# Log file with date
LOG_FILE="$LOG_DIR/scrape-$(date +%Y%m%d).log"

echo "======================================" | tee -a "$LOG_FILE"
echo "🎱 Snooker Rankings Scraper" | tee -a "$LOG_FILE"
echo "📅 $(date)" | tee -a "$LOG_FILE"
echo "======================================" | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"

# Add random delay (1-5 minutes) to avoid detection
DELAY=$((RANDOM % 240 + 60))
echo "⏱️  Waiting $DELAY seconds before scraping..." | tee -a "$LOG_FILE"
sleep $DELAY

# Run the Python scraper
echo "🕷️  Starting scrape..." | tee -a "$LOG_FILE"
python3 "$SCRIPT_DIR/scrape-rankings.py" 2>&1 | tee -a "$LOG_FILE"

echo "✅ Done!" | tee -a "$LOG_FILE"
