<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use App\Enums\UserRole;

/**
 * App user model.
 *
 * @property \App\Enums\UserRole $role
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => UserRole::class,
        ];
    }

    /**
     * Check whether the user has the given role.
     */
    public function hasRole(UserRole|string $role): bool
    {
        $current = $this->role instanceof UserRole ? $this->role->value : (string) $this->role;
        $check = $role instanceof UserRole ? $role->value : $role;

        return $current === $check;
    }

    /**
     * Check whether the user has any of the supplied roles.
     *
     * @param array<string|UserRole> $roles
     */
    public function hasAnyRole(array $roles): bool
    {
        $current = $this->role instanceof UserRole ? $this->role->value : (string) $this->role;

        $allowed = array_map(fn ($r) => $r instanceof UserRole ? $r->value : $r, $roles);

        return in_array($current, $allowed, true);
    }
}
