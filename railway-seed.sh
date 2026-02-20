#!/bin/bash

# 🚂 Script para ejecutar seeders en Railway
# Copia y pega estos comandos en la terminal de Railway

echo "🚀 Iniciando población de base de datos..."

# Opción 1: Resetear TODO (borra datos existentes)
echo ""
echo "⚠️  OPCIÓN 1: Resetear toda la base de datos"
echo "Esto BORRARÁ todos los datos existentes y creará:"
echo "  - 4 planes de suscripción"
echo "  - 5 tipos de pago"
echo "  - 19 géneros de películas"
echo "  - 10 usuarios de prueba con ubicaciones"
echo ""
echo "Comando:"
echo "php artisan migrate:fresh --seed"
echo ""

# Opción 2: Solo agregar seeders (conserva datos existentes)
echo "✅ OPCIÓN 2: Solo agregar datos nuevos (conserva existentes)"
echo "Ejecuta estos comandos uno por uno:"
echo ""
echo "php artisan db:seed --class=SubscriptionPlanSeeder"
echo "php artisan db:seed --class=PaymentTypeSeeder"
echo "php artisan db:seed --class=GenreSeeder"
echo "php artisan db:seed --class=UserSeeder"
echo ""

# Verificación
echo "🔍 Verificar que todo funcionó:"
echo "php artisan tinker"
echo "User::count()  // Debería mostrar 10"
echo "Genre::count() // Debería mostrar 19"
echo "SubscriptionPlan::count() // Debería mostrar 4"
echo "exit"
echo ""

echo "📧 Usuarios de prueba creados:"
echo "  pamela@gmail.com / 123456"
echo "  roberto@gmail.com / 123456"
echo "  ana@gmail.com / 123456"
echo "  luis@gmail.com / 123456"
echo "  renzo@gmail.com / 123456"
echo "  Y 5 más..."
