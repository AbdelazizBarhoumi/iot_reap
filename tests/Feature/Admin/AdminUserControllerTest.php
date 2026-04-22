<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\UserManagementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Pagination\LengthAwarePaginator;
use Mockery;
use Tests\TestCase;

class AdminUserControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $engineer;

    private $userManagementServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->engineer = User::factory()->engineer()->create();

        // Mock UserManagementService
        $this->userManagementServiceMock = Mockery::mock(UserManagementService::class);
        $this->app->instance(UserManagementService::class, $this->userManagementServiceMock);
    }

    public function test_admin_can_list_users(): void
    {
        // Create a mock paginated collection
        $users = new LengthAwarePaginator(
            [$this->engineer], // items
            2, // total
            15, // perPage
            1, // currentPage
            ['path' => request()->url()]
        );

        $stats = [
            'total' => 2,
            'engineers' => 1,
            'teachers' => 0,
            'admins' => 1,
        ];

        $this->userManagementServiceMock
            ->shouldReceive('getUsers')
            ->once()
            ->andReturn($users);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/users?per_page=15&sort_by=created_at&sort_direction=desc');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_admin_can_list_users_with_filters(): void
    {
        $users = new LengthAwarePaginator(
            [], // items
            0, // total
            10, // perPage
            1, // currentPage
            ['path' => request()->url()]
        );

        $this->userManagementServiceMock
            ->shouldReceive('getUsers')
            ->once()
            ->andReturn($users);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/users', [
                'per_page' => 10,
                'search' => 'john',
                'role' => 'teacher',
                'status' => 'suspended',
                'sort_by' => 'name',
                'sort_direction' => 'asc',
            ]);

        $response->assertOk();
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $response = $this->actingAs($this->engineer)
            ->getJson('/admin/users');

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_list_users(): void
    {
        $response = $this->getJson('/admin/users');

        $response->assertUnauthorized();
    }

    public function test_admin_can_view_user_detail(): void
    {
        $userWithDetails = $this->engineer;

        $this->userManagementServiceMock
            ->shouldReceive('getUserDetail')
            ->once()
            ->andReturn($userWithDetails);

        $response = $this->actingAs($this->admin)
            ->getJson("/admin/users/{$this->engineer->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                    'role',
                ],
            ]);
    }

    public function test_admin_can_suspend_user(): void
    {
        $suspendedUser = $this->engineer;
        $suspendedUser->suspended_at = now();
        $suspendedUser->suspended_reason = 'Violation of terms';

        $this->userManagementServiceMock
            ->shouldReceive('suspend')
            ->once()
            ->andReturn($suspendedUser);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/users/{$this->engineer->id}/suspend", [
                'reason' => 'Violation of terms',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'User suspended successfully',
            ])
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                ],
            ]);
    }

    public function test_suspend_user_validates_reason(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/admin/users/{$this->engineer->id}/suspend", [
                'reason' => 'short', // Too short
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['reason']);
    }

    public function test_admin_can_unsuspend_user(): void
    {
        $unsuspendedUser = $this->engineer;
        $unsuspendedUser->suspended_at = null;
        $unsuspendedUser->suspended_reason = null;

        $this->userManagementServiceMock
            ->shouldReceive('unsuspend')
            ->once()
            ->andReturn($unsuspendedUser);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/users/{$this->engineer->id}/unsuspend");

        $response->assertOk()
            ->assertJson([
                'message' => 'User unsuspended successfully',
            ]);
    }

    public function test_admin_can_update_user_role(): void
    {
        $updatedUser = $this->engineer;
        $updatedUser->role = UserRole::TEACHER;

        $this->userManagementServiceMock
            ->shouldReceive('updateRole')
            ->once()
            ->andReturn($updatedUser);

        $response = $this->actingAs($this->admin)
            ->patchJson("/admin/users/{$this->engineer->id}/role", [
                'role' => 'teacher',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'User role updated successfully',
            ]);
    }

    public function test_admin_can_approve_teacher_account(): void
    {
        $teacher = User::factory()->pendingTeacherApproval()->create();
        $approvedTeacher = $teacher->fresh();
        $approvedTeacher->teacher_approved_at = now();
        $approvedTeacher->teacher_approved_by = $this->admin->id;

        $this->userManagementServiceMock
            ->shouldReceive('approveTeacher')
            ->once()
            ->andReturn($approvedTeacher);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/users/{$teacher->id}/approve-teacher");

        $response->assertOk()
            ->assertJson([
                'message' => 'Teacher account approved successfully',
            ]);
    }

    public function test_admin_can_revoke_teacher_approval(): void
    {
        $teacher = User::factory()->teacher()->create([
            'teacher_approved_by' => $this->admin->id,
        ]);

        $updatedTeacher = $teacher->fresh();
        $updatedTeacher->teacher_approved_at = null;
        $updatedTeacher->teacher_approved_by = null;

        $this->userManagementServiceMock
            ->shouldReceive('revokeTeacherApproval')
            ->once()
            ->andReturn($updatedTeacher);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/users/{$teacher->id}/revoke-teacher-approval");

        $response->assertOk()
            ->assertJson([
                'message' => 'Teacher approval revoked successfully',
            ]);
    }

    public function test_update_role_validates_role(): void
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/admin/users/{$this->engineer->id}/role", [
                'role' => 'invalid-role',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['role']);
    }

    public function test_admin_can_start_impersonation(): void
    {
        $this->userManagementServiceMock
            ->shouldReceive('startImpersonation')
            ->once()
            ->andReturnNull();

        $response = $this->actingAs($this->admin)
            ->post("/admin/users/{$this->engineer->id}/impersonate");

        $response->assertRedirect(route('dashboard'))
            ->assertSessionHas('info');
    }

    public function test_admin_can_stop_impersonation(): void
    {
        $this->userManagementServiceMock
            ->shouldReceive('stopImpersonation')
            ->once()
            ->andReturn($this->admin);

        $response = $this->actingAs($this->admin)
            ->post('/stop-impersonation');

        $response->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success');
    }

    public function test_stop_impersonation_redirects_to_dashboard_when_no_admin(): void
    {
        $this->userManagementServiceMock
            ->shouldReceive('stopImpersonation')
            ->once()
            ->andReturn(null);

        $response = $this->actingAs($this->admin)
            ->post('/stop-impersonation');

        $response->assertRedirect(route('dashboard'));
    }

    public function test_admin_can_gdpr_delete_user(): void
    {
        $this->userManagementServiceMock
            ->shouldReceive('gdprDelete')
            ->once()
            ->andReturnNull();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/admin/users/{$this->engineer->id}/gdpr");

        $response->assertOk()
            ->assertJson([
                'message' => 'User data anonymized successfully (GDPR deletion)',
            ]);
    }

    public function test_non_admin_cannot_suspend_user(): void
    {
        $response = $this->actingAs($this->engineer)
            ->postJson("/admin/users/{$this->admin->id}/suspend", [
                'reason' => 'This should fail',
            ]);

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_update_user_role(): void
    {
        $response = $this->actingAs($this->engineer)
            ->patchJson("/admin/users/{$this->admin->id}/role", [
                'role' => 'admin',
            ]);

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_gdpr_delete_user(): void
    {
        $response = $this->actingAs($this->engineer)
            ->deleteJson("/admin/users/{$this->admin->id}/gdpr");

        $response->assertForbidden();
    }
}
