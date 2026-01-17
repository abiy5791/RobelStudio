# Docker setup (Backend + Frontend)

## Prereqs (Windows)
- Install Docker Desktop
- Ensure Docker Desktop is **running** and set to **Linux containers**
  - Docker Desktop → Settings → General → Use the WSL 2 based engine
  - Or tray menu → **Switch to Linux containers**

## Quick start
From the `qrp/` folder:

```sh
docker compose up --build
```

Open:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/

## Notes
- The frontend container (nginx) proxies:
  - `/api/*` → backend
  - `/media/*` → backend
- SQLite DB is persisted in the `backend_data` Docker volume.
- Uploaded images are persisted in the `backend_media` Docker volume.

## Secrets / env
- Docker Compose loads backend environment variables from `qrp/backend/.env` via `env_file`.
- Keep `qrp/backend/.env` private (don’t commit it).
- Set `DJANGO_SECRET_KEY` in [qrp/docker-compose.yml](qrp/docker-compose.yml) (or move it into `qrp/backend/.env` if you prefer).
- Template you can copy: `qrp/backend/.env.example`

## CORS
- Default (recommended): `DJANGO_CORS_ALLOW_ALL_ORIGINS=false` and use `CORS_ALLOWED_ORIGINS` allow-list in Django settings.
- For quick local testing you can set `DJANGO_CORS_ALLOW_ALL_ORIGINS=true`.

## Required env
Edit `qrp/docker-compose.yml` and set at least:
- `DJANGO_SECRET_KEY`

Optional but recommended:
- Email settings: `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, etc.
- If you are **not** terminating HTTPS in front of the backend container, keep `DJANGO_SECURE_SSL_REDIRECT=true`.
  If you are running locally without TLS, set `DJANGO_SECURE_SSL_REDIRECT=false`.

## Rebuild clean
```sh
docker compose down -v
docker compose build --no-cache
docker compose up
```
