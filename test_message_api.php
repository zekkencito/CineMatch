<?php
/**
 * 🧪 Script de prueba para el API de mensajes
 * Uso: php test_message_api.php <token> <match_id> <receiver_id> <mensaje>
 */

if (php_sapi_name() !== 'cli') {
    die("Este script solo puede ejecutarse desde CLI\n");
}

if ($argc < 4) {
    echo "Uso: php test_message_api.php <token> <match_id> <receiver_id> [mensaje]\n";
    echo "Ejemplo: php test_message_api.php 'Bearer token123' 1 2 'Hola!'\n";
    exit(1);
}

$token = $argv[1];
$match_id = (int)$argv[2];
$receiver_id = (int)$argv[3];
$mensaje = $argv[4] ?? 'Test message - ' . date('Y-m-d H:i:s');

$api_url = 'https://cinematch-production-7ba5.up.railway.app/api/messages';

$data = [
    'match_id' => $match_id,
    'receiver_id' => $receiver_id,
    'message' => $mensaje,
];

echo "📡 Enviando mensaje...\n";
echo "URL: $api_url\n";
echo "Token: " . substr($token, 0, 20) . "...\n";
echo "Datos: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

$ch = curl_init($api_url);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPAUTH => CURLAUTH_BEARER,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: ' . $token,
    ],
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_TIMEOUT => 10,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_VERBOSE => false,
]);

// Capturar respuesta
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);

curl_close($ch);

if ($curl_error) {
    echo "❌ Error de conexión: $curl_error\n";
    exit(1);
}

echo "📊 Respuesta HTTP: $http_code\n";
echo "─────────────────────────────────────────\n";

if ($response) {
    $json = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    } else {
        echo $response . "\n";
    }
} else {
    echo "Sin respuesta\n";
}

echo "─────────────────────────────────────────\n";

if ($http_code === 201) {
    echo "✅ Mensaje enviado exitosamente\n";
} elseif ($http_code >= 400) {
    echo "❌ Error en la respuesta\n";
} else {
    echo "⚠️  Respuesta inesperada\n";
}
?>
