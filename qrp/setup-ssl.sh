#!/bin/bash

# Replace with your actual domain and email
DOMAIN="api.robelstudio.com"
EMAIL="abiy19tek@gmail.com"

# Stop services if running
docker-compose down

# Start nginx for certificate challenge
docker-compose up -d nginx

# Wait for nginx to start
sleep 10

# Obtain certificate
docker run --rm \
  -v /data/certbot/conf:/etc/letsencrypt \
  -v /data/certbot/www:/var/www/certbot \
  -v /data/certbot/logs:/var/log/letsencrypt \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

# Restart services with SSL
docker-compose down
docker-compose up -d

echo "SSL certificate setup complete!"
echo "Remember to set up certificate renewal with cron job"