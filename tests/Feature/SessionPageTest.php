<?php

namespace Tests\Feature;

use App\Enums\VMSessionStatus;
use App\Models\ProxmoxNode;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SessionPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_session_page_renders_inertia_with_session_prop(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->create();
        $node = ProxmoxNode::factory()->create();

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'status' => VMSessionStatus::ACTIVE,
            ]);

        $this->actingAs($user)
            ->get("/sessions/{$session->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('sessions/show')
                // the JsonResource is wrapped with `data` when serialized,
                // so the actual prop is session.data.id
                ->where('session.data.id', $session->id)
            );
    }
}
