<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\UserMatch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MatchController extends Controller
{
    /**
     * Enviar like o dislike
     */
    public function sendLike(Request $request)
    {
        $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'type' => 'required|in:like,dislike',
        ]);

        $fromUserId = $request->user()->id;
        $toUserId = $request->to_user_id;

        // No permitir likes a uno mismo
        if ($fromUserId == $toUserId) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot like yourself'
            ], 400);
        }

        // Verificar si ya existe un like/dislike
        $existingLike = Like::where('from_user_id', $fromUserId)
            ->where('to_user_id', $toUserId)
            ->first();

        if ($existingLike) {
            // Actualizar el like existente
            $existingLike->update(['type' => $request->type]);
            $like = $existingLike;
        } else {
            // Crear nuevo like
            $like = Like::create([
                'from_user_id' => $fromUserId,
                'to_user_id' => $toUserId,
                'type' => $request->type,
            ]);
        }

        // Si es un like, verificar si hay match
        $matched = false;
        if ($request->type === 'like') {
            $reciprocalLike = Like::where('from_user_id', $toUserId)
                ->where('to_user_id', $fromUserId)
                ->where('type', 'like')
                ->first();

            if ($reciprocalLike) {
                // Hay match! Crear registro de match si no existe
                $match = UserMatch::firstOrCreate([
                    'user_one_id' => min($fromUserId, $toUserId),
                    'user_two_id' => max($fromUserId, $toUserId),
                ]);

                $matched = true;
            }
        }

        return response()->json([
            'success' => true,
            'like' => $like,
            'matched' => $matched,
        ]);
    }

    /**
     * Obtener todos los matches del usuario
     */
    public function getMatches(Request $request)
    {
        $userId = $request->user()->id;

        $matches = UserMatch::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->with(['userOne.favoriteGenres', 'userTwo.favoriteGenres'])
            ->orderBy('matched_at', 'desc')
            ->get();

        // Formatear matches para devolver el otro usuario
        $formattedMatches = $matches->map(function ($match) use ($userId) {
            $otherUser = $match->user_one_id == $userId 
                ? $match->userTwo 
                : $match->userOne;

            return [
                'id' => $match->id,
                'user' => $otherUser,
                'matched_at' => $match->matched_at,
            ];
        });

        return response()->json([
            'success' => true,
            'matches' => $formattedMatches
        ]);
    }

    /**
     * Verificar si hay match entre dos usuarios
     */
    public function checkMatch(Request $request, $userId)
    {
        $currentUserId = $request->user()->id;

        $match = UserMatch::where(function ($query) use ($currentUserId, $userId) {
            $query->where('user_one_id', min($currentUserId, $userId))
                  ->where('user_two_id', max($currentUserId, $userId));
        })->first();

        return response()->json([
            'success' => true,
            'matched' => $match !== null,
            'match' => $match
        ]);
    }

    /**
     * Obtener usuarios que dieron like al usuario actual
     */
    public function getLikes(Request $request)
    {
        $userId = $request->user()->id;

        $likes = Like::where('to_user_id', $userId)
            ->where('type', 'like')
            ->with('fromUser')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'likes' => $likes
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MatchController extends Controller
{
    //
}
