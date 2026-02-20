#!/bin/bash

echo "=== CineMatch Laravel Starting ==="

# Write .env from environment variables
printf "APP_NAME=CineMatch\n" > /app/.env
printf "APP_ENV=production\n" >> /app/.env
printf "APP_KEY=%s\n" "${APP_KEY}" >> /app/.env
printf "APP_DEBUG=false\n" >> /app/.env
printf "APP_URL=%s\n" "${APP_URL:-http://localhost}" >> /app/.env
printf "LOG_CHANNEL=stderr\n" >> /app/.env
printf "LOG_LEVEL=error\n" >> /app/.env
printf "DB_CONNECTION=%s\n" "${DB_CONNECTION:-mysql}" >> /app/.env
printf "DB_HOST=%s\n" "${DB_HOST:-127.0.0.1}" >> /app/.env
printf "DB_PORT=%s\n" "${DB_PORT:-3306}" >> /app/.env
printf "DB_DATABASE=%s\n" "${DB_DATABASE:-laravel}" >> /app/.env
printf "DB_USERNAME=%s\n" "${DB_USERNAME:-root}" >> /app/.env
printf "DB_PASSWORD=%s\n" "${DB_PASSWORD}" >> /app/.env
printf "CACHE_DRIVER=array\n" >> /app/.env
printf "SESSION_DRIVER=array\n" >> /app/.env
printf "QUEUE_CONNECTION=sync\n" >> /app/.env

php artisan config:clear 2>/dev/null || true

# Generate APP_KEY if missing
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force
fi

# Retry migrations up to 3 times
for i in 1 2 3; do
  php artisan migrate --force 2>&1 && break || sleep 5
done

echo "Starting on port ${PORT:-8080}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}