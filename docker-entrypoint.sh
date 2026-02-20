#!/bin/bash
set -x
echo "=== CineMatch Starting ==="
echo "APP_KEY=${APP_KEY}"
echo "DB_HOST=${DB_HOST}"

# Write .env
> /app/.env
echo "APP_NAME=CineMatch" >> /app/.env
echo "APP_ENV=production" >> /app/.env
echo "APP_DEBUG=false" >> /app/.env
echo "APP_KEY=${APP_KEY}" >> /app/.env
echo "APP_URL=${APP_URL:-http://localhost}" >> /app/.env
echo "LOG_CHANNEL=stderr" >> /app/.env
echo "LOG_LEVEL=error" >> /app/.env
echo "DB_CONNECTION=mysql" >> /app/.env
echo "DB_HOST=${DB_HOST:-127.0.0.1}" >> /app/.env
echo "DB_PORT=${DB_PORT:-3306}" >> /app/.env
echo "DB_DATABASE=${DB_DATABASE:-laravel}" >> /app/.env
echo "DB_USERNAME=${DB_USERNAME:-root}" >> /app/.env
echo "DB_PASSWORD=${DB_PASSWORD}" >> /app/.env
echo "CACHE_DRIVER=array" >> /app/.env
echo "SESSION_DRIVER=array" >> /app/.env
echo "QUEUE_CONNECTION=sync" >> /app/.env

# Generate key if missing
if [ -z "$APP_KEY" ]; then
  echo "Generating APP_KEY..."
  php artisan key:generate --force
fi

php artisan config:clear 2>/dev/null || true

echo "Starting server on port ${PORT:-8080}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
