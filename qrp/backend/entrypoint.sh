#!/bin/sh
set -eu

# Optional: wait for dependencies (none required for sqlite)

cd /app

# Ensure data dir exists for sqlite path override
mkdir -p "$(dirname "${DJANGO_DB_PATH:-/data/db.sqlite3}")"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

# Bind to all interfaces inside container
GUNICORN_BIND=${GUNICORN_BIND:-0.0.0.0:8000}
GUNICORN_WORKERS=${GUNICORN_WORKERS:-3}
GUNICORN_TIMEOUT=${GUNICORN_TIMEOUT:-120}

echo "Starting gunicorn on ${GUNICORN_BIND}"
exec gunicorn wedding_album.wsgi:application \
  --bind "${GUNICORN_BIND}" \
  --workers "${GUNICORN_WORKERS}" \
  --timeout "${GUNICORN_TIMEOUT}"
