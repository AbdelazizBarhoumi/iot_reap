<?php

namespace Tests\Feature;

use App\Enums\VMSessionStatus;
use App\Models\ProxmoxNode;
use App\Models\User;
use App\Models\VMSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SessionPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_session_page_renders_inertia_with_session_prop(): void
    {
        $user = User::factory()->engineer()->create();
        $node = ProxmoxNode::factory()->create();

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'node_id' => $node->id,
                'status' => VMSessionStatus::ACTIVE,
            ]);

        $this->actingAs($user)
            ->get("/sessions/{$session->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('sessions/show')
                // Inertia resolves JsonResource without the 'data' wrapper
                ->where('session.id', $session->id)
            );
    }
}
