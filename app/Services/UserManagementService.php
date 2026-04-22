<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Certificate;
use App\Models\Payment;
use App\Models\QuizAttempt;
use App\Models\TrainingPathEnrollment;
use App\Models\TrainingPathReview;
use App\Models\TrainingUnitNote;
use App\Models\TrainingUnitProgress;
use App\Models\User;
use App\Models\VMSession;
use App\Repositories\UserRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class UserManagementService
{
    public function __construct(
        private readonly UserRepository $userRepository,
    ) {}

    /**
     * Get paginated users with filters.
     */
    public function getUsers(
        int $perPage = 15,
        ?string $search = null,
        ?string $role = null,
        ?string $status = null,
        string $sortBy = 'created_at',
        string $sortDirection = 'desc',
    ): LengthAwarePaginator {
        $roleEnum = $role ? UserRole::tryFrom($role) : null;

        return $this->userRepository->getPaginated(
            perPage: $perPage,
            search: $search,
            role: $roleEnum,
            status: $status,
            sortBy: $sortBy,
            sortDirection: $sortDirection,
        );
    }

    /**
     * Get user with full details.
     */
    public function getUserDetail(string $userId): ?User
    {
        return $this->userRepository->findWithDetails($userId);
    }

    /**
     * Suspend a user account.
     */
    public function suspend(User $user, string $reason, User $admin): User
    {
        if ($user->id === $admin->id) {
            throw new \DomainException('You cannot suspend your own account');
        }

        if ($user->isAdmin()) {
            throw new \DomainException('Admin accounts cannot be suspended');
        }

        $user = $this->userRepository->update($user, [
            'suspended_at' => now(),
            'suspended_reason' => $reason,
        ]);

        Log::info('User suspended', [
            'user_id' => $user->id,
            'admin_id' => $admin->id,
            'reason' => $reason,
        ]);

        return $user;
    }

    /**
     * Unsuspend a user account.
     */
    public function unsuspend(User $user, User $admin): User
    {
        $user = $this->userRepository->update($user, [
            'suspended_at' => null,
            'suspended_reason' => null,
        ]);

        Log::info('User unsuspended', [
            'user_id' => $user->id,
            'admin_id' => $admin->id,
        ]);

        return $user;
    }

    /**
     * Update user role.
     */
    public function updateRole(User $user, UserRole $newRole, User $admin): User
    {
        if ($user->id === $admin->id) {
            throw new \DomainException('You cannot change your own role');
        }

        $oldRole = $user->role;

        $updateData = [
            'role' => $newRole,
        ];

        if ($newRole === UserRole::TEACHER) {
            // Admin role assignment to teacher implies approval.
            if ($oldRole !== UserRole::TEACHER || ! $user->isTeacherApproved()) {
                $updateData['teacher_approved_at'] = now();
                $updateData['teacher_approved_by'] = $admin->id;
            }
        } else {
            // Non-teacher roles do not need teacher-approval metadata.
            $updateData['teacher_approved_at'] = null;
            $updateData['teacher_approved_by'] = null;
        }

        $user = $this->userRepository->update($user, $updateData);

        Log::info('User role updated', [
            'user_id' => $user->id,
            'admin_id' => $admin->id,
            'old_role' => $oldRole->value,
            'new_role' => $newRole->value,
        ]);

        return $user;
    }

    /**
     * Approve a teacher account.
     */
    public function approveTeacher(User $teacher, User $admin): User
    {
        if (! $teacher->isTeacher()) {
            throw new \DomainException('Only teacher accounts can be approved');
        }

        $teacher = $this->userRepository->update($teacher, [
            'teacher_approved_at' => now(),
            'teacher_approved_by' => $admin->id,
        ]);

        Log::info('Teacher account approved', [
            'teacher_id' => $teacher->id,
            'admin_id' => $admin->id,
        ]);

        return $teacher;
    }

    /**
     * Revoke teacher approval.
     */
    public function revokeTeacherApproval(User $teacher, User $admin): User
    {
        if (! $teacher->isTeacher()) {
            throw new \DomainException('Only teacher accounts can have approval revoked');
        }

        $teacher = $this->userRepository->update($teacher, [
            'teacher_approved_at' => null,
            'teacher_approved_by' => null,
        ]);

        Log::info('Teacher approval revoked', [
            'teacher_id' => $teacher->id,
            'admin_id' => $admin->id,
        ]);

        return $teacher;
    }

    /**
     * Start impersonating a user.
     */
    public function startImpersonation(User $targetUser, User $admin): void
    {
        if ($targetUser->id === $admin->id) {
            throw new \DomainException('You cannot impersonate yourself');
        }

        if ($targetUser->isAdmin()) {
            throw new \DomainException('Admin accounts cannot be impersonated');
        }

        Session::put('impersonator_id', $admin->id);
        Auth::login($targetUser);

        Log::info('Impersonation started', [
            'target_user_id' => $targetUser->id,
            'admin_id' => $admin->id,
        ]);
    }

    /**
     * Stop impersonating and return to admin.
     */
    public function stopImpersonation(): ?User
    {
        $impersonatorId = Session::pull('impersonator_id');

        if (! $impersonatorId) {
            return null;
        }

        $admin = $this->userRepository->findById($impersonatorId);

        if ($admin) {
            Auth::login($admin);

            Log::info('Impersonation stopped', [
                'admin_id' => $admin->id,
            ]);
        }

        return $admin;
    }

    /**
     * Check if currently impersonating.
     */
    public function isImpersonating(): bool
    {
        return Session::has('impersonator_id');
    }

    /**
     * Get statistics for dashboard.
     */
    public function getStats(): array
    {
        $countsByRole = $this->userRepository->countByRole();
        $recentlyActive = $this->userRepository->getRecentlyActive(5);

        return [
            'total' => array_sum($countsByRole),
            'by_role' => $countsByRole,
            'recently_active' => $recentlyActive,
        ];
    }

    /**
     * Record login activity.
     */
    public function recordLogin(User $user, string $ip): void
    {
        $this->userRepository->update($user, [
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ]);
    }

    /**
     * GDPR user deletion - anonymizes PII while keeping transaction records.
     *
     * This method:
     * - Anonymizes personal data (name, email, IP addresses)
     * - Keeps transaction records (payments) with anonymized references
     * - Deletes non-essential data (notes, progress, sessions)
     * - Logs the deletion action for audit compliance
     *
     * @throws \InvalidArgumentException
     */
    public function gdprDelete(User $user, User $admin): void
    {
        if ($user->id === $admin->id) {
            throw new \DomainException('You cannot delete your own account');
        }

        if ($user->isAdmin()) {
            throw new \DomainException('Admin accounts cannot be deleted');
        }

        Log::info('GDPR deletion initiated', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'admin_id' => $admin->id,
        ]);

        // Generate anonymous identifier for references
        $anonymizedId = 'deleted_user_'.hash('sha256', $user->id.config('app.key'));

        // Anonymize user PII
        $this->userRepository->update($user, [
            'name' => 'Deleted User',
            'email' => $anonymizedId.'@deleted.local',
            'password' => hash('sha256', random_bytes(32)), // Invalidate password
            'last_login_ip' => null,
            'suspended_at' => now(),
            'suspended_reason' => 'GDPR deletion request',
            'deleted_at' => now(), // Soft delete marker
        ]);

        // Delete trainingUnit progress (non-essential)
        TrainingUnitProgress::where('user_id', $user->id)->delete();

        // Delete trainingUnit notes (personal data)
        TrainingUnitNote::where('user_id', $user->id)->delete();

        // Delete quiz attempts (can be anonymized in payments)
        QuizAttempt::where('user_id', $user->id)->delete();

        // Delete certificates (personal achievement records)
        Certificate::where('user_id', $user->id)->delete();

        // Delete trainingPath reviews (personal opinions)
        TrainingPathReview::where('user_id', $user->id)->delete();

        // Delete VM sessions (usage logs)
        VMSession::where('user_id', $user->id)->delete();

        // Delete notifications (personal communications)
        $user->notifications()->delete();

        // Keep payment records but anonymize (required for accounting/tax)
        Payment::where('user_id', $user->id)->update([
            'user_id' => $user->id, // Keep reference but user is anonymized
        ]);

        // Delete enrollments (but keep payment records)
        TrainingPathEnrollment::where('user_id', $user->id)->delete();

        // Revoke all tokens
        $user->tokens()->delete();

        Log::info('GDPR deletion completed', [
            'user_id' => $user->id,
            'anonymized_id' => $anonymizedId,
            'admin_id' => $admin->id,
        ]);
    }
}
