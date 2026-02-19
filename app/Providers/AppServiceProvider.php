<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\ProxmoxClient;
use App\Services\ProxmoxClientInterface;
use App\Services\ProxmoxLoadBalancer;
use App\Services\VMProvisioningService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
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
        // In testing without proper config, use the fake
        $this->app->singleton(ProxmoxClientInterface::class, function ($app) {
            $tokenId = config('proxmox.token_id');
            $tokenSecret = config('proxmox.token_secret');

            // If no credentials configured, use the fake client (tests / local dev)
            if (! $tokenId || ! $tokenSecret) {
                return new \App\Services\ProxmoxClientFake();
            }

            // Prefer an active ProxmoxServer record from the database
            $server = \App\Models\ProxmoxServer::where('is_active', true)->first();

            // If no DB server exists, build an in-memory server model from config
            if (! $server) {
                $server = new \App\Models\ProxmoxServer([
                    'name' => 'config-default',
                    'host' => config('proxmox.host'),
                    'port' => config('proxmox.port'),
                    'token_id' => $tokenId,
                    'token_secret' => $tokenSecret,
                    'is_active' => true,
                ]);
            }

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

        // Bind VMProvisioningService with all dependencies
        $this->app->bind(VMProvisioningService::class, function ($app) {
            return new VMProvisioningService(
                $app->make(\App\Repositories\VMSessionRepository::class),
                $app->make(ProxmoxLoadBalancer::class),
                $app->make(ProxmoxClientInterface::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
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
