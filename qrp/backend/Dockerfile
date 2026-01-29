# Stage 1: Build stage
FROM python:3.11-slim AS builder

# Prevent Python from writing .pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies in one layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    libmagic-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies into a specific path
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# Stage 2: Final runtime stage
FROM python:3.11-slim

WORKDIR /app

# Install only runtime shared libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libjpeg62-turbo \
    zlib1g \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Copy the pre-installed packages from the builder stage
COPY --from=builder /install /usr/local
COPY . .

# Optional: collectstatic if needed
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Use the full path for gunicorn to ensure it's picked up
CMD ["gunicorn", "--workers", "3", "--timeout", "120", "--bind", "0.0.0.0:8000", "wedding_album.wsgi:application"]