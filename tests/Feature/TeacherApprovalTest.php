<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_unapproved_teacher_is_redirected_to_pending_approval_page()
    {
        $user = User::factory()->create([
            'role' => UserRole::TEACHER,
            'teacher_approved_at' => null,
        ]);

        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('teacher.pending-approval'));
    }

    public function test_approved_teacher_is_redirected_to_teaching_index()
    {
        $user = User::factory()->create([
            'role' => UserRole::TEACHER,
            'teacher_approved_at' => now(),
        ]);

        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('teaching.index'));
    }

    public function test_approved_teacher_on_pending_approval_page_is_redirected_to_teaching_index()
    {
        $user = User::factory()->create([
            'role' => UserRole::TEACHER,
            'teacher_approved_at' => now(),
        ]);

        $this->actingAs($user);

        // When visiting the pending approval page while already approved
        $response = $this->get(route('teacher.pending-approval'));
        
        // It should redirect to teaching index (repro of the issue)
        $response->assertRedirect(route('teaching.index'));
    }

    public function test_non_teacher_on_pending_approval_page_is_redirected_to_dashboard()
    {
        $user = User::factory()->engineer()->create();

        $this->actingAs($user);

        $response = $this->get(route('teacher.pending-approval'));
        $response->assertRedirect(route('dashboard'));
    }
}
