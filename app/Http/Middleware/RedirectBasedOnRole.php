<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectBasedOnRole
{
    /**
     * Handle an incoming request.
     * Redirects authenticated users to role-appropriate pages:
     * - Engineer: redirect to trainingPaths
     * - Teacher: redirect to teaching dashboard
     * - Security Officer: redirect to trainingPaths
     * - Admin: redirect to admin dashboard
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Only apply to unauthenticated requests or redirects after login
        if (! $user) {
            return $next($request);
        }

        // Let route-level verified middleware handle unverified users.
        if (method_exists($user, 'hasVerifiedEmail') && ! $user->hasVerifiedEmail()) {
            return $next($request);
        }

        // If already on a dashboard/home page after login, redirect based on role
        $path = $request->path();
        if ($path === 'dashboard' || $path === '/') {
            if ($user->role === UserRole::TEACHER) {
                if ($user->isTeacherApproved()) {
                    return redirect()->route('teaching.index');
                } else {
                    return redirect()->route('teacher.pending-approval');
                }
            }

            return match ($user->role) {
                UserRole::ENGINEER => redirect()->route('trainingPaths.index'),
                UserRole::ADMIN => $next($request),
                default => $next($request),
            };
        }

        return $next($request);
    }
}
