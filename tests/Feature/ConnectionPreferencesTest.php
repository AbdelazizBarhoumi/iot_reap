<?php

namespace Tests\Feature;

use App\Enums\VMSessionStatus;
use App\Enums\VMTemplateProtocol;
use App\Models\GuacamoleConnectionPreference;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Models\ProxmoxNode;
use Tests\TestCase;

/**
 * Feature tests for GET/PATCH /api/vm-sessions/{session}/connection-preferences.
 *
 * Tests cover:
 *  - Owner can retrieve preferences (empty object when none saved)
 *  - Owner can save preferences (creates and updates)
 *  - Non-owner gets 403
 *  - Input validation
 *  - Protocol scoping (rdp prefs don't affect vnc)
 */
class ConnectionPreferencesTest extends TestCase
{
    private User $user;
    private VMSession $session;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user    = User::factory()->engineer()->create();
        $template      = VMTemplate::factory()->create(['protocol' => VMTemplateProtocol::RDP]);
        $node          = ProxmoxNode::factory()->create();
        $this->session = VMSession::factory()
            ->for($this->user)
            ->create([
                'template_id' => $template->id,
                'node_id'     => $node->id,
                'status'      => VMSessionStatus::ACTIVE,
                'ip_address'  => '10.0.0.99',
            ]);
    }

    // ─── GET /api/vm-sessions/{session}/connection-preferences ───────────────

    public function test_owner_gets_empty_preferences_when_none_saved(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/vm-sessions/{$this->session->id}/connection-preferences");

        $response->assertOk();
        $response->assertJsonPath('data.vm_session_type', 'rdp');
        $response->assertJsonPath('data.parameters', []);
    }

    public function test_owner_gets_saved_preferences(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id'         => $this->user->id,
            'vm_session_type' => 'rdp',
            'parameters'      => ['port' => 3389, 'width' => 1920, 'height' => 1080],
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/vm-sessions/{$this->session->id}/connection-preferences");

        $response->assertOk();
        $response->assertJsonPath('data.parameters.port', 3389);
        $response->assertJsonPath('data.parameters.width', 1920);
    }

    public function test_non_owner_gets_403_on_show(): void
    {
        $otherUser = User::factory()->engineer()->create();

        $response = $this->actingAs($otherUser)
            ->getJson("/api/vm-sessions/{$this->session->id}/connection-preferences");

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_get_preferences(): void
    {
        $response = $this->getJson("/api/vm-sessions/{$this->session->id}/connection-preferences");

        $response->assertUnauthorized();
    }

    // ─── PATCH /api/vm-sessions/{session}/connection-preferences ─────────────

    public function test_owner_can_save_preferences(): void
    {
        $response = $this->actingAs($this->user)
            ->patchJson("/api/vm-sessions/{$this->session->id}/connection-preferences", [
                'parameters' => [
                    'port'             => 13389,
                    'width'            => 1920,
                    'height'           => 1080,
                    'username'         => 'alice',
                    'disable-wallpaper' => true,
                    'enable-audio'     => false,
                ],
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.vm_session_type', 'rdp');
        $response->assertJsonPath('data.parameters.port', 13389);
        $response->assertJsonPath('data.parameters.username', 'alice');

        // Verify persisted in DB
        $this->assertDatabaseHas('guacamole_connection_preferences', [
            'user_id'         => $this->user->id,
            'vm_session_type' => 'rdp',
        ]);
    }

    public function test_owner_can_update_existing_preferences(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id'         => $this->user->id,
            'vm_session_type' => 'rdp',
            'parameters'      => ['port' => 3389, 'width' => 1280],
        ]);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/vm-sessions/{$this->session->id}/connection-preferences", [
                'parameters' => ['port' => 13389, 'width' => 2560],
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.parameters.port', 13389);
        $response->assertJsonPath('data.parameters.width', 2560);

        // Only one record should exist
        $this->assertCount(1, GuacamoleConnectionPreference::where([
            'user_id'         => $this->user->id,
            'vm_session_type' => 'rdp',
        ])->get());
    }

    public function test_non_owner_gets_403_on_update(): void
    {
        $otherUser = User::factory()->engineer()->create();

        $response = $this->actingAs($otherUser)
            ->patchJson("/api/vm-sessions/{$this->session->id}/connection-preferences", [
                'parameters' => ['port' => 3389],
            ]);

        $response->assertForbidden();
    }

    public function test_update_validates_port_range(): void
    {
        $response = $this->actingAs($this->user)
            ->patchJson("/api/vm-sessions/{$this->session->id}/connection-preferences", [
                'parameters' => ['port' => 99999], // invalid — max 65535
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('parameters.port');
    }

    public function test_update_validates_display_dimensions(): void
    {
        $response = $this->actingAs($this->user)
            ->patchJson("/api/vm-sessions/{$this->session->id}/connection-preferences", [
                'parameters' => ['width' => 100, 'height' => 50], // below min
            ]);

        $response->assertUnprocessable();
    }

    public function test_update_rejects_invalid_security_mode(): void
    {
        $response = $this->actingAs($this->user)
            ->patchJson("/api/vm-sessions/{$this->session->id}/connection-preferences", [
                'parameters' => ['security' => 'invalid-mode'],
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('parameters.security');
    }

    public function test_preferences_are_scoped_per_protocol(): void
    {
        // Save RDP prefs
        $this->actingAs($this->user)
            ->patchJson("/api/vm-sessions/{$this->session->id}/connection-preferences", [
                'parameters' => ['port' => 13389],
            ])
            ->assertOk();

        // Create a VNC session and save VNC prefs
        $vncTemplate = VMTemplate::factory()->create(['protocol' => VMTemplateProtocol::VNC]);
        $vncNode     = ProxmoxNode::factory()->create();
        $vncSession  = VMSession::factory()
            ->for($this->user)
            ->create([
                'template_id' => $vncTemplate->id,
                'node_id'     => $vncNode->id,
            ]);

        $this->actingAs($this->user)
            ->patchJson("/api/vm-sessions/{$vncSession->id}/connection-preferences", [
                'parameters' => ['port' => 5901],
            ])
            ->assertOk();

        // RDP and VNC preferences are stored separately
        $this->assertDatabaseCount('guacamole_connection_preferences', 2);
        $this->assertDatabaseHas('guacamole_connection_preferences', [
            'user_id' => $this->user->id, 'vm_session_type' => 'rdp',
        ]);
        $this->assertDatabaseHas('guacamole_connection_preferences', [
            'user_id' => $this->user->id, 'vm_session_type' => 'vnc',
        ]);
    }
}
