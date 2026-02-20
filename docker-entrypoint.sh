#!/bin/bash
echo "=== CineMatch Starting ==="

printf "APP_NAME=CineMatch\nAPP_ENV=production\nAPP_KEY=%s\nAPP_DEBUG=false\n" "${APP_KEY}" > /app/.env
printf "LOG_CHANNEL=stderr\nLOG_LEVEL=error\n" >> /app/.env
printf "DB_CONNECTION=mysql\nDB_HOST=%s\nDB_PORT=%s\nDB_DATABASE=%s\nDB_USERNAME=%s\nDB_PASSWORD=%s\n" "${DB_HOST:-127.0.0.1}" "${DB_PORT:-3306}" "${DB_DATABASE:-laravel}" "${DB_USERNAME:-root}" "${DB_PASSWORD}" >> /app/.env
printf "CACHE_DRIVER=array\nSESSION_DRIVER=array\nQUEUE_CONNECTION=sync\n" >> /app/.env

if [ -z "$APP_KEY" ]; then php artisan key:generate --force; fi
php artisan config:clear 2>/dev/null || true

echo "Starting server on port ${PORT:-8080}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}