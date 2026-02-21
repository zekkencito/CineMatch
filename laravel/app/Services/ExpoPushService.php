<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ExpoPushService
{
    /**
     * Envía una notificación Push usando el API de Expo.
     *
     * @param string $to (El Expo Push Token)
     * @param string $title (El título de la notificación)
     * @param string $body (El cuerpo de la mensaje)
     * @param array $data (Payload adicional)
     * @return bool
     */
    public static function send($to, $title, $body, $data = [])
    {
        if (!$to) {
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Accept-encoding' => 'gzip, deflate',
                'Content-Type' => 'application/json',
            ])->post('https://exp.host/--/api/v2/push/send', [
                'to' => $to,
                'sound' => 'default',
                'title' => $title,
                'body' => $body,
                'data' => $data,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            \Log::error('Error enviando notificación push Expo: ' . $e->getMessage());
            return false;
        }
    }
}
