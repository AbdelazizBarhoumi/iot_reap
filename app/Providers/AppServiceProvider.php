<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\User;
use App\Repositories\ProxmoxServerRepository;
use App\Services\GuacamoleClient;
use App\Services\GuacamoleClientInterface;
use App\Services\GuacamoleClientFake;
use App\Services\ProxmoxClient;
use App\Services\ProxmoxClientFactory;
use App\Services\ProxmoxClientInterface;
use App\Services\ProxmoxLoadBalancer;
use App\Services\ProxmoxServerSelector;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
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
            $server = \App\Models\ProxmoxServer::where('is_active', true)->first();

            if ($server) {
                // Database server has encrypted credentials - use it
                return new ProxmoxClient($server);
            }

            // Fall back to env config if no DB server exists
            $tokenId = config('proxmox.token_id');
            $tokenSecret = config('proxmox.token_secret');

            // If no credentials anywhere, use the fake client (tests / local dev)
            if (! $tokenId || ! $tokenSecret) {
                return new \App\Services\ProxmoxClientFake();
            }

            // Build an in-memory server model from config
            $server = new \App\Models\ProxmoxServer([
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
        $this->app->singleton(ProxmoxClient::class, fn($app) => $app->make(ProxmoxClientInterface::class));

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
            if (!$username || !$password) {
                return new GuacamoleClientFake();
            }

            return new GuacamoleClient();
        });

        // For backward compatibility, bind concrete GuacamoleClient to the interface
        $this->app->singleton(GuacamoleClient::class, fn($app) => $app->make(GuacamoleClientInterface::class));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Disable resource wrapping for Inertia
        JsonResource::withoutWrapping();
        
        //model strict
        Model::shouldBeStrict();
        $this->configureDefaults();

        // register `role:` route middleware alias
        $this->app->make(Router::class)->aliasMiddleware('role', \App\Http\Middleware\EnsureRole::class);

        // gates based on UserRole enum (names per phase-1 spec)
        Gate::define('admin-only', fn(User $user) => $user->hasRole(UserRole::ADMIN));
        Gate::define('security-officer-only', fn(User $user) => $user->hasRole(UserRole::SECURITY_OFFICER));
        Gate::define('provision-vm', fn(User $user) => $user->hasAnyRole([
            UserRole::ENGINEER->value,
            UserRole::ADMIN->value,
        ]));
        Gate::define('create-vm-session', fn(User $user) => $user->hasAnyRole([
            UserRole::ENGINEER->value,
            UserRole::ADMIN->value,
        ]));

        // Teaching gate — only teachers and admins can manage courses
        Gate::define('teach', fn(User $user) => $user->hasAnyRole([
            UserRole::TEACHER->value,
            UserRole::ADMIN->value,
        ]));

        // generic role gate for programmatic checks: Gate::allows('role', 'admin')
        Gate::define('role', fn(User $user, string $role) => $user->hasRole($role));
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
}
