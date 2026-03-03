<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Login como administrador
     * En una aplicación real, tendrías un modelo Admin separado
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        // Buscar usuario en la tabla users
        $user = User::where('email', $validated['email'])->first();

        // Verificar si existe y si es admin
        if (!$user || !$user->is_admin) {
            return response()->json(['message' => 'Acceso denegado. No eres administrador.'], 401);
        }

        // Verificar contraseña
        if (!\Illuminate\Support\Facades\Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        // Generar token
        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'role' => 'admin'
            ]
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    // ============ DASHBOARD ============

    /**
     * Obtener estadísticas del dashboard
     */
    public function getDashboardStats()
    {
        try {
            $totalUsers = User::count();
            $premiumUsers = Subscription::where('plan', 'premium')->where('is_active', true)->count();
            $freeUsers = Subscription::where('plan', 'free')->where('is_active', true)->count();
            
            // Calcular ingresos en pesos mexicanos (solo premium genera ingresos)
            $totalRevenue = $premiumUsers * 500; // 500 MXN por suscripción premium

            // Comparar últimos 30 días vs 30 días anteriores para dato más realista
            $newUsersLast30 = User::where('created_at', '>=', Carbon::now()->subDays(30))->count();
            $newUsersPrevious30 = User::where('created_at', '>=', Carbon::now()->subDays(60))
                ->where('created_at', '<', Carbon::now()->subDays(30))
                ->count();

            $monthGrowth = $newUsersPrevious30 > 0 
                ? round((($newUsersLast30 - $newUsersPrevious30) / $newUsersPrevious30) * 100, 1)
                : 0;

            // Películas populares
            $topMovies = DB::table('watched_movies')
                ->selectRaw('title, poster_path, tmdb_movie_id, COUNT(*) as matches')
                ->groupBy('title', 'poster_path', 'tmdb_movie_id')
                ->orderByDesc('matches')
                ->limit(3)
                ->get();

            // Usuarios más activos (por likes enviados)
            $topUsers = User::selectRaw('users.name, COUNT(likes.id) as matches')
                ->leftJoin('likes', 'users.id', '=', 'likes.from_user_id')
                ->groupBy('users.id', 'users.name')
                ->orderByDesc('matches')
                ->limit(3)
                ->get();

            return response()->json([
                'stats' => [
                    [
                        'title' => 'Total de Usuarios',
                        'value' => $totalUsers,
                        'change' => '+' . $monthGrowth . '%',
                        'isPositive' => $monthGrowth >= 0,
                    ],
                    [
                        'title' => 'Usuarios Premium',
                        'value' => $premiumUsers,
                        'change' => '+2.1%',
                        'isPositive' => true,
                    ],
                    [
                        'title' => 'Suscripciones Gratis',
                        'value' => $freeUsers,
                        'change' => '+3.1%',
                        'isPositive' => true,
                    ],
                    [
                        'title' => 'Ingresos Totales',
                        'value' => '$' . number_format($totalRevenue, 2) . ' MXN',
                        'change' => '+8.2%',
                        'isPositive' => true,
                    ],
                ],
                'topMovies' => $topMovies,
                'topUsers' => $topUsers,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'stats' => [],
                'topMovies' => [],
                'topUsers' => [],
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener gráficos para el dashboard
     */
    public function getDashboardCharts()
    {
        try {
            // Gráfico de usuarios por mes
            $usersPerMonth = User::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as users')
                ->where('created_at', '>=', Carbon::now()->subMonths(6))
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->month,
                        'users' => $item->users
                    ];
                });

            // Gráfico de usuarios por día (últimos 30 días)
            $usersPerDay = User::selectRaw('DATE_FORMAT(created_at, "%Y-%m-%d") as day, COUNT(*) as users')
                ->where('created_at', '>=', Carbon::now()->subDays(30))
                ->groupBy('day')
                ->orderBy('day')
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->day,
                        'users' => $item->users
                    ];
                });

            // Gráfico de usuarios por semana (últimas 12 semanas)
            $usersPerWeek = User::selectRaw('DATE_FORMAT(created_at, "%Y-W%v") as week, COUNT(*) as users')
                ->where('created_at', '>=', Carbon::now()->subWeeks(12))
                ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-W%v")'))
                ->orderBy('week')
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => 'Sem ' . substr($item->week, 6),
                        'users' => $item->users
                    ];
                });

            // Ingresos por día (últimos 30 días)
            $revenuePerDay = Subscription::selectRaw(
                'DATE_FORMAT(created_at, "%Y-%m-%d") as day, 
                COUNT(*) * 500 as revenue'
            )
                ->where('is_active', true)
                ->where('plan', 'premium')
                ->where('created_at', '>=', Carbon::now()->subDays(30))
                ->groupBy('day')
                ->orderBy('day')
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->day,
                        'revenue' => intval($item->revenue),
                    ];
                });

            // Ingresos por semana (últimas 12 semanas)
            $revenuePerWeek = Subscription::selectRaw(
                'DATE_FORMAT(created_at, "%Y-W%v") as week, 
                COUNT(*) * 500 as revenue'
            )
                ->where('is_active', true)
                ->where('plan', 'premium')
                ->where('created_at', '>=', Carbon::now()->subWeeks(12))
                ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-W%v")'))
                ->orderBy('week')
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => 'Sem ' . substr($item->week, 6),
                        'revenue' => intval($item->revenue),
                    ];
                });

            // Ingresos por mes (últimos 6 meses)
            $revenuePerMonth = Subscription::selectRaw(
                'DATE_FORMAT(created_at, "%Y-%m") as month, 
                COUNT(*) * 500 as revenue'
            )
                ->where('is_active', true)
                ->where('plan', 'premium')
                ->where('created_at', '>=', Carbon::now()->subMonths(6))
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->month,
                        'revenue' => intval($item->revenue),
                    ];
                });

            // Gráfico de suscripciones por tipo
            $subscriptionsByPlan = Subscription::selectRaw('plan, COUNT(*) as count')
                ->where('is_active', true)
                ->groupBy('plan')
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => ucfirst($item->plan),
                        'value' => $item->count,
                    ];
                });

            // Gráfico de suscripciones activas vs inactivas
            $subscriptionStatus = Subscription::selectRaw('CASE WHEN is_active = 1 THEN "Active" ELSE "Inactive" END as status, COUNT(*) as count')
                ->groupBy(DB::raw('CASE WHEN is_active = 1 THEN "Active" ELSE "Inactive" END'))
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => ucfirst($item->status),
                        'value' => $item->count,
                    ];
                });

            return response()->json([
                'usersPerDay' => $usersPerDay,
                'usersPerWeek' => $usersPerWeek,
                'usersPerMonth' => $usersPerMonth,
                'subscriptionsByPlan' => $subscriptionsByPlan,
                'subscriptionStatus' => $subscriptionStatus,
                'revenuePerDay' => $revenuePerDay,
                'revenuePerWeek' => $revenuePerWeek,
                'revenuePerMonth' => $revenuePerMonth,
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard Charts Error: ' . $e->getMessage());
            return response()->json([
                'usersPerDay' => [],
                'usersPerWeek' => [],
                'usersPerMonth' => [],
                'subscriptionsByPlan' => [],
                'subscriptionStatus' => [],
                'revenuePerDay' => [],
                'revenuePerWeek' => [],
                'revenuePerMonth' => [],
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener películas más populares
     */
    private function getTopMovies($limit = 10)
    {
        return DB::table('watched_movies')
            ->selectRaw('title, poster_path, tmdb_movie_id, COUNT(*) as matches')
            ->groupBy('title', 'poster_path', 'tmdb_movie_id')
            ->orderByDesc('matches')
            ->limit($limit)
            ->get();
    }

    /**
     * Obtener usuarios más activos (por matches)
     */
    private function getTopUsers($limit = 10)
    {
        return DB::table('matches')
            ->join('users', function($join) {
                $join->on('matches.user_one_id', '=', 'users.id')
                     ->orOn('matches.user_two_id', '=', 'users.id');
            })
            ->selectRaw('users.name, COUNT(*) as matches')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('matches')
            ->limit($limit)
            ->get();
    }

    // ============ USUARIOS ============

    /**
     * Obtener lista de usuarios con paginación
     */
    public function getUsers(Request $request)
    {
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 100);
        $search = $request->get('search', '');

        $query = User::select(
            'users.id',
            'users.name',
            'users.email',
            'users.age',
            'users.bio',
            'users.created_at'
        );

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Agregar subquery de matches
        $query->addSelect(DB::raw('COALESCE((
            SELECT COUNT(*) FROM `matches` 
            WHERE (`matches`.`user_one_id` = `users`.`id` OR `matches`.`user_two_id` = `users`.`id`)
        ), 0) as match_count'));

        // Agregar subquery para obtener el plan de suscripción
        $query->addSelect(DB::raw('COALESCE((
            SELECT `plan` FROM `subscriptions` 
            WHERE `subscriptions`.`user_id` = `users`.`id` AND `subscriptions`.`is_active` = 1
            ORDER BY `subscriptions`.`created_at` DESC LIMIT 1
        ), "free") as subscription_plan'));

        $users = $query->paginate($perPage, ['*'], 'page', $page);

        // Transformar respuesta
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'age' => $user->age,
                'bio' => $user->bio,
                'createdAt' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
                'matches' => (int)$user->match_count,
                'subscription' => $user->subscription_plan,
            ];
        });

        return response()->json($users);
    }

    /**
     * Obtener detalles de un usuario
     */
    public function getUser($id)
    {
        $user = User::with(['location', 'favoriteGenres', 'subscription'])
            ->findOrFail($id);

        // Count matches
        $matchCount = DB::table('matches')
            ->where('user_one_id', $id)
            ->orWhere('user_two_id', $id)
            ->count();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'age' => $user->age,
            'bio' => $user->bio,
            'profilePhoto' => $user->profile_photo,
            'location' => $user->location,
            'favoriteGenres' => $user->favoriteGenres,
            'subscription' => $user->subscription,
            'matches' => $matchCount,
            'createdAt' => $user->created_at,
        ]);
    }

    /**
     * Crear usuario
     */
    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'age' => 'nullable|integer|min:13|max:120',
            'bio' => 'nullable|string|max:500',
            'password' => 'sometimes|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'age' => $validated['age'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'password' => bcrypt($validated['password'] ?? 'CineMatch2026!'),
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    /**
     * Actualizar usuario
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'age' => 'nullable|integer|min:13|max:120',
            'bio' => 'nullable|string|max:500',
        ]);

        $user->update($validated);

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    /**
     * Eliminar usuario
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Estadísticas de usuarios
     */
    public function getUserStatistics()
    {
        return response()->json([
            'total' => User::count(),
            'thisMonth' => User::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
            'withLocation' => DB::table('locations')->distinct('user_id')->count('user_id'),
            'totalMatches' => DB::table('matches')->count(),
        ]);
    }

    // ============ PLANES DE SUSCRIPCIÓN ============

    /**
     * Obtener todos los planes de suscripción
     */
    public function getSubscriptionPlans()
    {
        $plans = SubscriptionPlan::all();
        return response()->json($plans);
    }

    /**
     * Obtener detalles de un plan
     */
    public function getSubscriptionPlan($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        return response()->json($plan);
    }

    /**
     * Crear nuevo plan
     */
    public function createSubscriptionPlan(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:subscription_plans',
            'price' => 'required|numeric|min:0',
            'daily_likes' => 'required|integer|min:0',
            'see_who_liked' => 'required|boolean',
            'advanced_filters' => 'required|boolean',
            'duration_days' => 'required|integer|min:1',
        ]);

        $plan = SubscriptionPlan::create($validated);

        return response()->json(['message' => 'Plan created successfully', 'plan' => $plan], 201);
    }

    /**
     * Actualizar plan
     */
    public function updateSubscriptionPlan(Request $request, $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:subscription_plans,name,' . $id,
            'price' => 'sometimes|numeric|min:0',
            'daily_likes' => 'sometimes|integer|min:0',
            'see_who_liked' => 'sometimes|boolean',
            'advanced_filters' => 'sometimes|boolean',
            'duration_days' => 'sometimes|integer|min:1',
        ]);

        $plan->update($validated);

        return response()->json(['message' => 'Plan updated successfully', 'plan' => $plan]);
    }

    /**
     * Eliminar plan
     */
    public function deleteSubscriptionPlan($id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        // Verificar que no haya suscripciones activas
        if (Subscription::where('subscription_plan_id', $id)->exists()) {
            return response()->json(['message' => 'Cannot delete plan with active subscriptions'], 409);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan deleted successfully']);
    }

    /**
     * Estadísticas de suscripciones
     */
    public function getSubscriptionStatistics()
    {
        $totalSubscriptions = Subscription::count();
        $activeSubscriptions = Subscription::where('is_active', true)->count();
        $premiumCount = Subscription::where('plan', 'premium')->where('is_active', true)->count();
        $totalRevenue = $premiumCount * 500; // 500 MXN por premium

        $byPlan = Subscription::selectRaw('plan, COUNT(*) as count')
            ->where('is_active', true)
            ->groupBy('plan')
            ->get();

        return response()->json([
            'total' => $totalSubscriptions,
            'active' => $activeSubscriptions,
            'revenue' => $totalRevenue,
            'byPlan' => $byPlan,
        ]);
    }

    /**
     * Obtener suscripciones de un usuario
     */
    public function getUserSubscriptions($userId)
    {
        $subscriptions = Subscription::where('user_id', $userId)
            ->with('plan')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($subscriptions);
    }
}
