# ============ Stage 1: Build Admin Panel ============
FROM node:20-alpine AS admin-build

WORKDIR /admin

# Copy admin panel files
COPY admin_panel/package.json admin_panel/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of admin panel source
COPY admin_panel/ .

# Build for production
RUN npm run build

# ============ Stage 2: PHP + Laravel + Admin Panel ============
FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy Laravel project
COPY laravel/ .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy built admin panel into Laravel's public/admin directory
COPY --from=admin-build /admin/dist/ ./public/admin/

# Ensure directories exist and set permissions
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

# Force rebuild - Admin panel included (2026-03-03)
ENTRYPOINT ["/docker-entrypoint.sh"]
