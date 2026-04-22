<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * App user model.
 *
 * @property string $id
 * @property UserRole $role
 */
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
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
        'email_verified_at',
        'teacher_approved_at',
        'teacher_approved_by',
        'suspended_at',
        'suspended_reason',
        'last_login_at',
        'last_login_ip',
        'google_id',
        'google_data',
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
            'teacher_approved_at' => 'datetime',
            'suspended_at' => 'datetime',
            'last_login_at' => 'datetime',
            'google_data' => 'json',
        ];
    }

    /**
     * Check whether the user is a teacher.
     */
    public function isTeacher(): bool
    {
        return $this->hasRole(UserRole::TEACHER);
    }

    /**
     * Check whether a teacher account has been approved by an admin.
     */
    public function isTeacherApproved(): bool
    {
        if (! $this->isTeacher()) {
            return true;
        }

        return $this->teacher_approved_at !== null;
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

    /**
     * Admin who approved the teacher account.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_approved_by');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * TrainingPaths the user is enrolled in.
     */
    public function enrolledTrainingPaths(): BelongsToMany
    {
        return $this->belongsToMany(TrainingPath::class, 'training_path_enrollments')
            ->withPivot('enrolled_at')
            ->withTimestamps();
    }

    /**
     * TrainingPaths the user teaches (as instructor).
     */
    public function taughtTrainingPaths(): HasMany
    {
        return $this->hasMany(TrainingPath::class, 'instructor_id');
    }

    /**
     * User's quiz attempts.
     */
    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /**
     * User's payments.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * User's notifications.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
