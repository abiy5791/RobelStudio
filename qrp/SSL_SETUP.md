# SSL Certificate Setup with Certbot

## Prerequisites
- Domain name pointing to your server
- Docker and Docker Compose installed
- Ports 80 and 443 open on your server

## Setup Steps

### 1. Update Configuration Files
Before running, update these files with your actual domain:

**nginx/nginx.conf:**
- Replace `your-domain.com` with your actual domain name

**setup-ssl.sh:**
- Replace `your-domain.com` with your actual domain
- Replace `your-email@example.com` with your email

### 2. Make Scripts Executable
```bash
chmod +x setup-ssl.sh
chmod +x renew-ssl.sh
```

### 3. Initial SSL Certificate Setup
```bash
# Run the SSL setup script
./setup-ssl.sh
```

This script will:
- Start nginx temporarily
- Use Certbot to obtain SSL certificates
- Restart services with SSL enabled

### 4. Verify SSL Setup
After setup, your backend will be available at:
- `https://your-domain.com` (SSL enabled)
- HTTP requests will automatically redirect to HTTPS

### 5. Set Up Certificate Auto-Renewal
Add to crontab for automatic renewal:
```bash
# Edit crontab
crontab -e

# Add this line to renew certificates twice daily
0 12 * * * /path/to/your/project/renew-ssl.sh
```

## Directory Structure Created
```
/data/
├── certbot/
│   ├── conf/          # SSL certificates
│   ├── www/           # Challenge files
│   └── logs/          # Certbot logs
├── media/             # Django media files
└── static/            # Django static files
```

## Backend SSL Configuration
The backend is configured to:
- Trust SSL headers from nginx proxy
- Force HTTPS redirects in production
- Set secure cookies
- Enable security headers

## Troubleshooting
- Ensure domain DNS points to your server
- Check firewall allows ports 80 and 443
- Verify docker-compose services are running
- Check nginx logs: `docker-compose logs nginx`
- Check certbot logs in `/data/certbot/logs/`