<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * App user model.
 *
 * @property string $id
 * @property \App\Enums\UserRole $role
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasUlids, Notifiable, TwoFactorAuthenticatable;

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
        'suspended_at',
        'suspended_reason',
        'last_login_at',
        'last_login_ip',
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
            'suspended_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Check if the user is suspended.
     */
    public function isSuspended(): bool
    {
        return $this->suspended_at !== null;
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
     * Check whether the user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::ADMIN);
    }

    /**
     * Check whether the user has any of the supplied roles.
     *
     * @param  array<string|UserRole>  $roles
     */
    public function hasAnyRole(array $roles): bool
    {
        $current = $this->role instanceof UserRole ? $this->role->value : (string) $this->role;

        $allowed = array_map(fn ($r) => $r instanceof UserRole ? $r->value : $r, $roles);

        return in_array($current, $allowed, true);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Courses the user is enrolled in.
     */
    public function enrolledCourses(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_enrollments')
            ->withPivot('enrolled_at')
            ->withTimestamps();
    }

    /**
     * Courses the user teaches (as instructor).
     */
    public function taughtCourses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    /**
     * User's quiz attempts.
     */
    public function quizAttempts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /**
     * User's payments.
     */
    public function payments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * User's notifications.
     */
    public function notifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
