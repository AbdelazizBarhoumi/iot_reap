<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * Roles are passed as a comma-separated list, e.g. `role:admin,security_officer`.
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        $allowed = array_map('trim', explode(',', $roles));

        $current = $user->role instanceof \App\Enums\UserRole ? $user->role->value : (string) $user->role;

        if (! in_array($current, $allowed, true)) {
            abort(403);
        }

        return $next($request);
    }
}
