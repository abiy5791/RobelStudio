#!/bin/bash

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Add renewal job to crontab (runs weekly on Sunday at 3:00 AM)
(crontab -l 2>/dev/null; echo "0 3 * * 0 $SCRIPT_DIR/renew-ssl.sh >> /var/log/certbot-renewal.log 2>&1") | crontab -

echo "Cron job added for automatic certificate renewal"
echo "Renewal will run weekly on Sunday at 3:00 AM"
echo "Logs will be saved to /var/log/certbot-renewal.log"