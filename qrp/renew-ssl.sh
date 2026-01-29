#!/bin/bash

# Renew certificates
docker run --rm \
  -v /data/certbot/conf:/etc/letsencrypt \
  -v /data/certbot/www:/var/www/certbot \
  -v /data/certbot/logs:/var/log/letsencrypt \
  certbot/certbot renew --quiet

# Reload nginx if renewal was successful
if [ $? -eq 0 ]; then
    docker-compose exec nginx nginx -s reload
    echo "Certificate renewal completed and nginx reloaded"
else
    echo "Certificate renewal failed"
fi