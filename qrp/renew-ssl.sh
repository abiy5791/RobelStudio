#!/bin/bash

# Renew certificates
docker run --rm \
  -v /data/certbot/conf:/etc/letsencrypt \
  -v /data/certbot/www:/var/www/certbot \
  -v /data/certbot/logs:/var/log/letsencrypt \
  certbot/certbot renew --quiet

# Reload nginx to use new certificates
docker-compose exec nginx nginx -s reload

echo "Certificate renewal completed"