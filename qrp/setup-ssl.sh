#!/bin/bash

# Replace with your actual domain and email
DOMAIN="api.robelstudio.com"
EMAIL="abiy19tek@gmail.com"

# Stop services if running
docker-compose down

# Create directories
sudo mkdir -p /data/certbot/conf
sudo mkdir -p /data/certbot/www
sudo mkdir -p /data/certbot/logs

# Use initial nginx config for challenge
cp nginx/nginx-initial.conf nginx/nginx.conf

# Start nginx for certificate challenge
docker-compose up -d nginx

# Wait for nginx to start
sleep 15

# Test if nginx is serving the challenge directory
echo "Testing nginx challenge directory..."
curl -I http://$DOMAIN/.well-known/acme-challenge/test || echo "Challenge directory not accessible"

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
  --staging \
  -d $DOMAIN

# If staging works, get real certificate
if [ $? -eq 0 ]; then
    echo "Staging certificate successful, getting real certificate..."
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
      --force-renewal \
      -d $DOMAIN
    
    # Restore full nginx config with SSL
    git checkout nginx/nginx.conf
    sed -i "s/your-domain.com/$DOMAIN/g" nginx/nginx.conf
fi

# Restart services with SSL
docker-compose down
docker-compose up -d

echo "SSL certificate setup complete!"
echo "Run ./setup-cron.sh to set up automatic renewal"