# Backend (Django) Dockerfile
# - Uses gunicorn for production-style serving
# - Persists SQLite + media via docker volumes (configured in docker-compose.yml)

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# System deps for Pillow (and general build)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libjpeg62-turbo-dev \
        zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy project
COPY . /app

# Default locations (compose overrides with volumes)
ENV DJANGO_DB_PATH=/data/db.sqlite3 \
    DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1 \
    DJANGO_USE_WHITENOISE=true

EXPOSE 8000

# Entrypoint runs migrate + collectstatic then starts gunicorn
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && mkdir -p /data /app/media

ENTRYPOINT ["/entrypoint.sh"]
