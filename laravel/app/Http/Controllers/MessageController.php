<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Matches;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    /**
     * Obtener todos los mensajes de un match específico
     */
    public function getMessages(Request $request, $matchId)
    {
        try {
            $userId = Auth::id();

            // Verificar que el match existe y el usuario es parte de él
            $match = Matches::where('id', $matchId)
                ->where(function ($query) use ($userId) {
                    $query->where('user_one_id', $userId)
                          ->orWhere('user_two_id', $userId);
                })
                ->first();

            if (!$match) {
                return response()->json([
                    'success' => false,
                    'message' => 'Match no encontrado o no tienes acceso'
                ], 404);
            }

            // Obtener mensajes del match ordenados por fecha
            $messages = Message::where('match_id', $matchId)
                ->orderBy('created_at', 'asc')
                ->with(['sender:id,name,profile_photo', 'receiver:id,name,profile_photo'])
                ->get();

            // Marcar como leídos los mensajes que recibió el usuario actual
            Message::where('match_id', $matchId)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'messages' => $messages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener mensajes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enviar un nuevo mensaje
     */
    public function sendMessage(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'match_id' => 'required|exists:matches,id',
                'receiver_id' => 'required|exists:users,id',
                'message' => 'required|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validación fallida',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userId = Auth::id();
            $matchId = $request->match_id;
            $receiverId = $request->receiver_id;

            // Verificar que el match existe y el usuario es parte de él
            $match = Matches::where('id', $matchId)
                ->where(function ($query) use ($userId, $receiverId) {
                    $query->where(function ($q) use ($userId, $receiverId) {
                        $q->where('user_one_id', $userId)
                          ->where('user_two_id', $receiverId);
                    })->orWhere(function ($q) use ($userId, $receiverId) {
                        $q->where('user_one_id', $receiverId)
                          ->where('user_two_id', $userId);
                    });
                })
                ->first();

            if (!$match) {
                return response()->json([
                    'success' => false,
                    'message' => 'Match inválido o no tienes acceso'
                ], 403);
            }

            // Crear el mensaje
            $message = Message::create([
                'match_id' => $matchId,
                'sender_id' => $userId,
                'receiver_id' => $receiverId,
                'message' => $request->message,
                'is_read' => false,
            ]);

            // Cargar relaciones para retornar datos completos
            $message->load(['sender:id,name,profile_photo', 'receiver:id,name,profile_photo']);

            return response()->json([
                'success' => true,
                'message' => 'Mensaje enviado',
                'data' => $message
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar mensaje: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener el conteo de mensajes no leídos
     */
    public function getUnreadCount(Request $request)
    {
        try {
            $userId = Auth::id();

            $unreadCount = Message::where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            return response()->json([
                'success' => true,
                'unread_count' => $unreadCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener contador: ' . $e->getMessage()
            ], 500);
        }
    }
}
