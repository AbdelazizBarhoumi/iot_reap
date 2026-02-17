<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Gate;
use App\Enums\UserRole;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //model strict
        Model::shouldBeStrict();
        $this->configureDefaults();

        // register `role:` and `ensure.role:` route middleware aliases
        $this->app->make(Router::class)->aliasMiddleware('role', \App\Http\Middleware\RoleMiddleware::class);
        $this->app->make(Router::class)->aliasMiddleware('ensure.role', \App\Http\Middleware\EnsureRole::class);

        // convenience gates based on UserRole enum
        Gate::define('isAdmin', fn(User $user) => $user->hasAnyRole([UserRole::ADMIN->value]));
        Gate::define('isSecurityOfficer', fn(User $user) => $user->hasAnyRole([UserRole::SECURITY_OFFICER->value]));

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
