<?php

namespace App\Http\Controllers;

use App\Models\UserUnlockedFrame;
use Carbon\Carbon;
use Illuminate\Http\Request;

class GamificationController extends Controller
{
    private const FRAME_CATALOG = [
        ['id' => 'classic_gold', 'name' => 'Clasico Dorado', 'unlock_day' => 1],
        ['id' => 'noir_silver', 'name' => 'Noir Plateado', 'unlock_day' => 3],
        ['id' => 'neon_pop', 'name' => 'Neon Pop', 'unlock_day' => 7],
        ['id' => 'epic_scarlet', 'name' => 'Epico Escarlata', 'unlock_day' => 14],
        ['id' => 'director_cut', 'name' => 'Director Cut', 'unlock_day' => 30],
    ];

    public function getState(Request $request)
    {
        $user = $request->user();
        $this->ensureBaseFrame($user);

        $unlockedFrames = $user->unlockedFrames()->pluck('frame_id')->toArray();

        return response()->json([
            'success' => true,
            'gamification' => [
                'current_streak' => (int) $user->current_streak,
                'best_streak' => (int) $user->best_streak,
                'last_active_date' => $user->last_active_date,
                'equipped_frame' => $user->equipped_frame ?: 'classic_gold',
                'total_activities' => (int) $user->total_activities,
                'unlocked_frames' => $unlockedFrames,
                'frame_catalog' => self::FRAME_CATALOG,
                'next_reward' => $this->getNextReward((int) $user->current_streak),
            ],
        ]);
    }

    public function trackActivity(Request $request)
    {
        $request->validate([
            'activity_type' => 'nullable|string|max:50',
        ]);

        $user = $request->user();
        $this->ensureBaseFrame($user);

        $today = Carbon::today();
        $didCountForStreak = false;

        if (!$user->last_active_date) {
            $user->current_streak = 1;
            $user->last_active_date = $today->toDateString();
            $didCountForStreak = true;
        } else {
            $lastActive = Carbon::parse($user->last_active_date)->startOfDay();
            $diff = $lastActive->diffInDays($today, false);

            if ($diff === 0) {
                // Ya contó hoy.
            } elseif ($diff > 1) {
                $user->current_streak = 1;
                $user->last_active_date = $today->toDateString();
                $didCountForStreak = true;
            } elseif ($diff === 1) {
                $user->current_streak = ((int) $user->current_streak) + 1;
                $user->last_active_date = $today->toDateString();
                $didCountForStreak = true;
            }
        }

        $user->total_activities = ((int) $user->total_activities) + 1;
        $user->best_streak = max((int) $user->best_streak, (int) $user->current_streak);

        $newlyUnlocked = [];
        $alreadyUnlocked = $user->unlockedFrames()->pluck('frame_id')->toArray();

        foreach (self::FRAME_CATALOG as $frame) {
            if ((int) $user->current_streak >= (int) $frame['unlock_day'] && !in_array($frame['id'], $alreadyUnlocked, true)) {
                UserUnlockedFrame::create([
                    'user_id' => $user->id,
                    'frame_id' => $frame['id'],
                    'unlocked_at' => now(),
                ]);
                $alreadyUnlocked[] = $frame['id'];
                $newlyUnlocked[] = $frame['id'];
            }
        }

        if (empty($user->equipped_frame) || !in_array($user->equipped_frame, $alreadyUnlocked, true)) {
            $user->equipped_frame = 'classic_gold';
        }

        $user->save();

        return response()->json([
            'success' => true,
            'did_count_for_streak' => $didCountForStreak,
            'newly_unlocked' => $newlyUnlocked,
            'gamification' => [
                'current_streak' => (int) $user->current_streak,
                'best_streak' => (int) $user->best_streak,
                'last_active_date' => $user->last_active_date,
                'equipped_frame' => $user->equipped_frame,
                'total_activities' => (int) $user->total_activities,
                'unlocked_frames' => $alreadyUnlocked,
                'next_reward' => $this->getNextReward((int) $user->current_streak),
            ],
        ]);
    }

    public function equipFrame(Request $request)
    {
        $request->validate([
            'frame_id' => 'required|string|max:50',
        ]);

        $user = $request->user();
        $this->ensureBaseFrame($user);

        $frameId = $request->frame_id;
        $catalogIds = array_map(fn($f) => $f['id'], self::FRAME_CATALOG);

        if (!in_array($frameId, $catalogIds, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Frame invalido',
            ], 422);
        }

        $unlocked = $user->unlockedFrames()->where('frame_id', $frameId)->exists();
        if (!$unlocked) {
            return response()->json([
                'success' => false,
                'message' => 'Frame no desbloqueado',
            ], 403);
        }

        $user->equipped_frame = $frameId;
        $user->save();

        return response()->json([
            'success' => true,
            'equipped_frame' => $user->equipped_frame,
        ]);
    }

    private function ensureBaseFrame($user): void
    {
        if ($user->unlockedFrames()->count() === 0) {
            UserUnlockedFrame::create([
                'user_id' => $user->id,
                'frame_id' => 'classic_gold',
                'unlocked_at' => now(),
            ]);
        }

        if (empty($user->equipped_frame)) {
            $user->equipped_frame = 'classic_gold';
            $user->save();
        }
    }

    private function getNextReward(int $currentStreak): ?array
    {
        foreach (self::FRAME_CATALOG as $frame) {
            if ($frame['unlock_day'] > $currentStreak) {
                return $frame;
            }
        }

        return null;
    }
}
