<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Location;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Registro de nuevo usuario
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'age' => 'nullable|integer|min:18',
            'bio' => 'nullable|string|max:500',
            'profile_photo' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'age' => $request->age,
            'bio' => $request->bio,
            'profile_photo' => $request->profile_photo,
        ]);

        // Crear ubicación del usuario si se proporcionan coordenadas
        if ($request->has('latitude') && $request->has('longitude')) {
            $user->location()->create([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'city' => $request->city ?? 'Unknown',
                'country' => $request->country ?? 'Unknown',
                'search_radius' => $request->search_radius ?? 2000, // 2000km por defecto
            ]);
        }

        // Crear suscripción free por defecto
        $user->subscription()->create([
            'plan' => 'free',
            'status' => 'active',
            'max_radius' => 50,
            'daily_likes_limit' => 10,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Cargar la relación location
        $user->load('location');

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login de usuario
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Logout de usuario
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load(['location', 'favoriteGenres', 'subscription']);
        
        // Agregar campo is_premium en el objeto user
        $userData = $user->toArray();
        $userData['is_premium'] = $user->isPremium();
        
        return response()->json([
            'success' => true,
            'user' => $userData
        ]);
    }

    /**
     * Actualizar perfil
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'age' => 'sometimes|integer|min:18',
            'bio' => 'sometimes|string|max:500',
            'profile_photo' => 'sometimes|string',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'search_radius' => 'sometimes|integer|min:1|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Actualizar datos básicos del usuario
        $user->update($request->only(['name', 'age', 'bio', 'profile_photo']));

        // Actualizar o crear ubicación si se proporcionan datos de ubicación
        if ($request->hasAny(['latitude', 'longitude', 'search_radius'])) {
            $locationData = $request->only(['latitude', 'longitude', 'search_radius']);
            
            if ($user->location) {
                $user->location->update($locationData);
            } else {
                $user->location()->create($locationData);
            }
        }

        // Cargar la relación location
        $user->load('location');

        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    /**
     * Social login (Google)
     * Recibe idToken de Google, lo verifica y crea/autentica usuario
     */
    public function socialLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_token' => 'required|string',
            'provider' => 'required|string|in:google',
            'name' => 'nullable|string',
            'email' => 'nullable|email',
            'photo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $idToken = $request->id_token;
        $provider = $request->provider;

        // Verificar el token con Google
        try {
            $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $idToken,
            ]);

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token de Google inválido'
                ], 401);
            }

            $googleUser = $response->json();
            $googleId = $googleUser['sub'] ?? null;
            $email = $googleUser['email'] ?? $request->email;
            $name = $googleUser['name'] ?? $request->name ?? 'Usuario';
            $photo = $googleUser['picture'] ?? $request->photo;

            if (!$googleId || !$email) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo obtener información del usuario de Google'
                ], 400);
            }

            // Buscar usuario por google_id o email
            $user = User::where('google_id', $googleId)->first();

            if (!$user) {
                $user = User::where('email', $email)->first();

                if ($user) {
                    // Usuario existe con ese email, vincular Google ID
                    $user->update(['google_id' => $googleId]);
                } else {
                    // Crear nuevo usuario
                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make(uniqid('google_', true)),
                        'google_id' => $googleId,
                        'profile_photo' => $photo,
                    ]);

                    // Crear suscripción free por defecto
                    $user->subscription()->create([
                        'plan' => 'free',
                        'status' => 'active',
                        'max_radius' => 50,
                        'daily_likes_limit' => 10,
                    ]);
                }
            } else {
                // Actualizar foto si cambió
                if ($photo && $user->profile_photo !== $photo) {
                    $user->update(['profile_photo' => $photo]);
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;
            $user->load('location');

            $isNewUser = $user->wasRecentlyCreated;

            return response()->json([
                'success' => true,
                'user' => $user,
                'token' => $token,
                'is_new_user' => $isNewUser,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar con Google: ' . $e->getMessage()
            ], 500);
        }
    }
}
