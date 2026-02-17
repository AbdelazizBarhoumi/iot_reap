<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     * Accepts comma-separated roles via variadic params: role:admin,security_officer
     * Returns 403 JSON response if role not allowed — never redirects.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $allowed = array_map('trim', $roles);

        $current = $user->role instanceof \App\Enums\UserRole ? $user->role->value : (string) $user->role;

        if (! in_array($current, $allowed, true)) {
            return response()->json(['message' => 'Access denied. Insufficient role permissions.'], 403);
        }

        return $next($request);
    }
}
