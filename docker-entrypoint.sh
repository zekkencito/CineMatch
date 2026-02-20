#!/bin/bash
set -e

echo "=== CineMatch Laravel Server Starting ==="

# Run migrations
echo "Running migrations..."
php artisan config:clear
php artisan migrate --force

echo "Starting server on port ${PORT:-8080}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
