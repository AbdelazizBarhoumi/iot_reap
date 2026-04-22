<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Http\Middleware\EnsureRole;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Repositories\ProxmoxServerRepository;
use App\Services\GuacamoleClient;
use App\Services\GuacamoleClientFake;
use App\Services\GuacamoleClientInterface;
use App\Services\ProxmoxClient;
use App\Services\ProxmoxClientFactory;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use App\Services\ProxmoxLoadBalancer;
use App\Services\ProxmoxServerSelector;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind ProxmoxClientInterface as singleton
        // Priority: DB server credentials > env credentials > fake client
        $this->app->singleton(ProxmoxClientInterface::class, function ($app) {
            // First, try to get an active ProxmoxServer from the database
            $server = ProxmoxServer::where('is_active', true)->first();

            if ($server) {
                // Database server has encrypted credentials - use it
                return new ProxmoxClient($server);
            }

            // Fall back to env config if no DB server exists
            $tokenId = config('proxmox.token_id');
            $tokenSecret = config('proxmox.token_secret');

            // If no credentials anywhere, use the fake client (tests / local dev)
            if (! $tokenId || ! $tokenSecret) {
                return new ProxmoxClientFake;
            }

            // Build an in-memory server model from config
            $server = new ProxmoxServer([
                'name' => 'config-default',
                'host' => config('proxmox.host'),
                'port' => config('proxmox.port'),
                'token_id' => $tokenId,
                'token_secret' => $tokenSecret,
                'is_active' => true,
            ]);

            return new ProxmoxClient($server);
        });

        // For backward compatibility, bind concrete ProxmoxClient to the interface
        $this->app->singleton(ProxmoxClient::class, fn ($app) => $app->make(ProxmoxClientInterface::class));

        // Bind ProxmoxLoadBalancer with ProxmoxClientInterface dependency
        $this->app->bind(ProxmoxLoadBalancer::class, function ($app) {
            return new ProxmoxLoadBalancer(
                $app->make(ProxmoxClientInterface::class)
            );
        });

        // Bind new multi-server support services
        $this->app->singleton(ProxmoxServerRepository::class);
        $this->app->singleton(ProxmoxClientFactory::class);
        $this->app->singleton(ProxmoxServerSelector::class, function ($app) {
            return new ProxmoxServerSelector(
                $app->make(ProxmoxServerRepository::class),
                $app->make(ProxmoxClientFactory::class),
                $app->make(ProxmoxLoadBalancer::class)
            );
        });

        // Bind GuacamoleClientInterface as singleton
        // In testing without proper config, use the fake
        $this->app->singleton(GuacamoleClientInterface::class, function ($app) {
            $username = config('guacamole.username');
            $password = config('guacamole.password');

            // If no credentials configured, use the fake client (tests / local dev)
            if (! $username || ! $password) {
                return new GuacamoleClientFake;
            }

            return new GuacamoleClient;
        });

        // For backward compatibility, bind concrete GuacamoleClient to the interface
        $this->app->singleton(GuacamoleClient::class, fn ($app) => $app->make(GuacamoleClientInterface::class));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Disable resource wrapping for Inertia
        JsonResource::withoutWrapping();

        // model strict
        Model::shouldBeStrict();
        $this->configureDefaults();
        $this->configureRateLimiting();

        // register `role:` route middleware alias
        $this->app->make(Router::class)->aliasMiddleware('role', EnsureRole::class);

        // gates based on UserRole enum (names per phase-1 spec)
        Gate::define('admin-only', fn (User $user) => $user->hasRole(UserRole::ADMIN));
        Gate::define('admin', fn (User $user) => $user->hasRole(UserRole::ADMIN));
        Gate::define('provision-vm', fn (User $user) => $user->hasAnyRole([
            UserRole::ENGINEER->value,
            UserRole::ADMIN->value,
        ]));
        Gate::define('create-vm-session', fn (User $user) => $user->hasAnyRole([
            UserRole::ENGINEER->value,
            UserRole::ADMIN->value,
        ]));

        // Teaching gate — admins always allowed; teachers must be approved.
        Gate::define('teach', fn (User $user) => $user->hasRole(UserRole::ADMIN)
            || ($user->hasRole(UserRole::TEACHER) && $user->isTeacherApproved())
        );

        // generic role gate for programmatic checks: Gate::allows('role', 'admin')
        Gate::define('role', fn (User $user, string $role) => $user->hasRole($role));
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }

    /**
     * Configure rate limiting for API and auth routes.
     */
    protected function configureRateLimiting(): void
    {
        // General API rate limit: 100 requests per minute for authenticated users
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(100)->by($request->user()?->id ?: $request->ip());
        });

        // Authentication routes: 10 attempts per minute to prevent brute force
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // VM session provisioning: 5 per minute per user (expensive operation)
        RateLimiter::for('vm-provision', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
        });

        // Search requests: 30 per minute to prevent abuse
        RateLimiter::for('search', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });

        // Forum posting: 10 threads/replies per minute per user
        RateLimiter::for('forum', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        // TrainingPath creation: 5 per hour per user (to prevent spam)
        RateLimiter::for('trainingPath-creation', function (Request $request) {
            return Limit::perHour(50000)->by($request->user()?->id ?: $request->ip());
        });

        // Admin endpoints: higher limit for trusted users
        RateLimiter::for('admin', function (Request $request) {
            return Limit::perMinute(200)->by($request->user()?->id ?: $request->ip());
        });

        // Global fallback: 60 requests per minute
        RateLimiter::for('global', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });
    }
}
