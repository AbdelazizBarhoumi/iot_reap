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
        'Permissions-Policy' => 'camera=(self), microphone=(self), geolocation=(), payment=(), autoplay=(self "https://www.youtube.com" "https://www.youtube-nocookie.com"), encrypted-media=(self "https://www.youtube.com" "https://www.youtube-nocookie.com"), fullscreen=(self "https://www.youtube.com" "https://www.youtube-nocookie.com")',
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
        $scriptSrc = "'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.youtube.com https://s.ytimg.com"; // Required for Vite/React + Google OAuth + YouTube
        $styleSrc = "'self' 'unsafe-inline' https://accounts.google.com https://www.youtube.com"; // Required for inline styles + Google OAuth + YouTube
        $connectSrc = "'self' wss: https: ws: https://*.google.com https://*.youtube.com"; // Allow ws: for Guacamole WebSocket + YouTube APIs
        $imgSrc = "'self' data: https: blob: https://*.ytimg.com https://*.youtube.com";
        $fontSrc = "'self' data: https://fonts.gstatic.com";

        // Build worker-src separately to avoid using development values in production.
        $workerSrc = "'self' blob: https://www.youtube.com";

        // In development, allow Vite dev server on any local interface
        if (! app()->isProduction()) {
            $vitePort = config('app.vite_port', 5173);

            // Allow Vite on localhost and 127.0.0.1 for any port (development flexibility)
            $viteUrls = [
                "http://localhost:{$vitePort}",
                "http://127.0.0.1:{$vitePort}",
            ];

            foreach ($viteUrls as $viteUrl) {
                $scriptSrc .= " {$viteUrl}";
                $styleSrc .= " {$viteUrl}";
                $connectSrc .= " {$viteUrl} ws://".str_replace('http://', '', $viteUrl);
                $imgSrc .= " {$viteUrl}";
                $fontSrc .= " {$viteUrl}";
                $workerSrc .= " {$viteUrl}";
            }
        }

        // Add Guacamole WebSocket URL (convert http:/https: to ws:/wss:)
        $guacUrl = config('guacamole.url');
        if ($guacUrl) {
            $guacWsUrl = preg_replace('#^https?://#', '', $guacUrl);
            $connectSrc .= " ws://{$guacWsUrl} wss://{$guacWsUrl}";
        }

        $directives = [
            "default-src 'self'",
            "script-src $scriptSrc",
            "style-src $styleSrc",
            "img-src $imgSrc",
            "font-src $fontSrc",
            "connect-src $connectSrc",
            "media-src 'self' blob: https://*.youtube.com https://*.youtube-nocookie.com https://*.googlevideo.com",
            "frame-src 'self' https://*.youtube.com https://*.youtube-nocookie.com https://*.google.com https://accounts.google.com",
            "child-src 'self' blob: https://*.youtube.com https://*.youtube-nocookie.com https://*.google.com",
            "worker-src $workerSrc",
            "object-src 'none'",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
        ];

        return implode('; ', $directives);
    }
}
