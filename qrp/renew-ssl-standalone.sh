#!/bin/bash

# Stop nginx to free port 80
docker-compose stop nginx

# Renew certificates using standalone method
docker run --rm \
  -p 80:80 \
  -v /data/certbot/conf:/etc/letsencrypt \
  -v /data/certbot/logs:/var/log/letsencrypt \
  certbot/certbot renew --standalone --quiet

# Restart nginx if renewal was successful
if [ $? -eq 0 ]; then
    docker-compose start nginx
    echo "Certificate renewal completed and nginx restarted"
else
    docker-compose start nginx
    echo "Certificate renewal failed, nginx restarted anyway"
fi