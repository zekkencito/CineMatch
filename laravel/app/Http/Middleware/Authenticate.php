<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        if (! $request->expectsJson()) {
            if (\Route::has('login')) {
                return route('login');
            }
            // If the named login route is not defined (API-only deployments),
            // avoid throwing RouteNotFoundException and return a safe URL.
            return url('/');
        }
        return null;
    }
}
