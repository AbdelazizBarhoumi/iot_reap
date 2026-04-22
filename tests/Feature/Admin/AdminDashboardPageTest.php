<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\SystemAlert;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardPageTest extends TestCase
{
    public function test_admin_dashboard_includes_alerts_and_activity_logs(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $actor = User::factory()->create();

        SystemAlert::create([
            'severity' => 'warning',
            'title' => 'Gateway offline',
            'description' => 'Gateway node is not responding.',
            'source' => 'hardware',
            'acknowledged' => false,
            'resolved' => false,
        ]);

        ActivityLog::create([
            'type' => 'system',
            'action' => 'Refresh',
            'description' => 'Admin refreshed the dashboard.',
            'user_id' => $actor->id,
            'status' => 'completed',
        ]);

        $this->actingAs($admin)
            ->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/DashboardPage')
                ->has('alerts', 1)
                ->has('activityLogs', 1)
                ->where('alerts.0.title', 'Gateway offline')
                ->where('activityLogs.0.action', 'Refresh')
            );
    }
}
