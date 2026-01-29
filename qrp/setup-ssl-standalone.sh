#!/bin/bash

# Replace with your actual domain and email
DOMAIN="api.robelstudio.com"
EMAIL="abiy19tek@gmail.com"

# Stop all services to free port 80
docker-compose down

# Create directories
sudo mkdir -p /data/certbot/conf
sudo mkdir -p /data/certbot/logs

# Obtain certificate using standalone method (staging first)
echo "Getting staging certificate..."
docker run --rm \
  -p 80:80 \
  -v /data/certbot/conf:/etc/letsencrypt \
  -v /data/certbot/logs:/var/log/letsencrypt \
  certbot/certbot certonly \
  --standalone \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --staging \
  -d $DOMAIN

# If staging works, get real certificate
if [ $? -eq 0 ]; then
    echo "Staging certificate successful, getting real certificate..."
    docker run --rm \
      -p 80:80 \
      -v /data/certbot/conf:/etc/letsencrypt \
      -v /data/certbot/logs:/var/log/letsencrypt \
      certbot/certbot certonly \
      --standalone \
      --email $EMAIL \
      --agree-tos \
      --no-eff-email \
      --force-renewal \
      -d $DOMAIN
fi

# Start services with SSL
docker-compose up -d

echo "SSL certificate setup complete!"
echo "Run ./setup-cron.sh to set up automatic renewal"