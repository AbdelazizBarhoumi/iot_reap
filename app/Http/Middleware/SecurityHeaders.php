<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Add security headers to all responses.
 */
class SecurityHeaders
{
    /**
     * Security headers configuration.
     *
     * @var array<string, string>
     */
    protected array $headers = [
        // Prevent clickjacking
        'X-Frame-Options' => 'SAMEORIGIN',

        // Prevent MIME-type sniffing
        'X-Content-Type-Options' => 'nosniff',

        // Enable XSS protection in older browsers
        'X-XSS-Protection' => '1; mode=block',

        // Control referrer information
        'Referrer-Policy' => 'strict-origin-when-cross-origin',

        // Restrict browser features
        'Permissions-Policy' => 'camera=(self), microphone=(self), geolocation=(), payment=()',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Apply security headers
        foreach ($this->headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        // Add HSTS in production (HTTP Strict Transport Security)
        if (app()->isProduction() && $request->secure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        // Add Content-Security-Policy for non-API routes
        if (! $request->expectsJson() && ! $request->is('api/*')) {
            $response->headers->set(
                'Content-Security-Policy',
                $this->buildCsp()
            );
        }

        return $response;
    }

    /**
     * Build Content-Security-Policy header.
     */
    protected function buildCsp(): string
    {
        $scriptSrc = "'self' 'unsafe-inline' 'unsafe-eval'"; // Required for Vite/React
        $styleSrc = "'self' 'unsafe-inline'"; // Required for inline styles
        $connectSrc = "'self' wss: https:";

        // In development, allow Vite dev server
        if (! app()->isProduction()) {
            $viteHost = config('app.vite_host', 'localhost');
            $vitePort = config('app.vite_port', 5173);
            $viteUrl = "http://{$viteHost}:{$vitePort}";

            $scriptSrc .= " {$viteUrl}";
            $styleSrc .= " {$viteUrl}";
            $connectSrc .= " {$viteUrl} ws://{$viteHost}:{$vitePort}";
        }

        $directives = [
            "default-src 'self'",
            "script-src $scriptSrc",
            "style-src $styleSrc",
            "img-src 'self' data: https: blob:",
            "font-src 'self' data:",
            "connect-src $connectSrc",
            "media-src 'self' blob:",
            "object-src 'none'",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
        ];

        return implode('; ', $directives);
    }
}
