<?php

namespace Tests\Feature;

use App\Models\GuacamoleConnectionPreference;
use App\Models\User;
use Tests\TestCase;

/**
 * Feature tests for connection preferences API (user-scoped, per protocol).
 *
 * Routes:
 *  - GET    /connection-preferences           (all profiles grouped by protocol)
 *  - GET    /connection-preferences/{protocol} (all profiles for one protocol)
 *  - POST   /connection-preferences/{protocol} (create new profile)
 *  - PUT    /connection-preferences/{protocol}/{profile?} (update profile)
 *  - DELETE /connection-preferences/{protocol}/{profile}  (delete profile)
 *  - PATCH  /connection-preferences/{protocol}/{profile}/default (set default)
 *
 * Tests cover:
 *  - User can retrieve profiles (empty when none saved)
 *  - User can create/update profiles
 *  - Input validation
 *  - Multiple profiles per protocol
 *  - Default profile management
 */
class ConnectionPreferencesTest extends TestCase
{
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->engineer()->create();
    }

    // ─── GET /connection-preferences ──────────────────────────────────────────

    public function test_user_gets_empty_profiles_when_none_saved(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/connection-preferences');

        $response->assertOk();
        $response->assertJsonPath('data.rdp', []);
        $response->assertJsonPath('data.vnc', []);
        $response->assertJsonPath('data.ssh', []);
    }

    public function test_user_gets_all_saved_profiles(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Work',
            'is_default' => true,
            'parameters' => ['port' => 3389, 'width' => 1920],
        ]);
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Home',
            'is_default' => false,
            'parameters' => ['port' => 3390],
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/connection-preferences');

        $response->assertOk();
        $response->assertJsonCount(2, 'data.rdp');
        $response->assertJsonPath('data.rdp.0.profile_name', 'Work');
        $response->assertJsonPath('data.rdp.0.is_default', true);
    }

    public function test_unauthenticated_user_cannot_get_preferences(): void
    {
        $response = $this->getJson('/connection-preferences');
        $response->assertUnauthorized();
    }

    // ─── GET /connection-preferences/{protocol} ───────────────────────────────

    public function test_user_gets_profiles_for_protocol(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Default',
            'is_default' => true,
            'parameters' => ['port' => 3389],
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/connection-preferences/rdp');

        $response->assertOk();
        $response->assertJsonPath('data.protocol', 'rdp');
        $response->assertJsonCount(1, 'data.profiles');
        $response->assertJsonPath('data.profiles.0.profile_name', 'Default');
    }

    public function test_invalid_protocol_returns_422(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/connection-preferences/invalid');

        $response->assertUnprocessable();
    }

    // ─── POST /connection-preferences/{protocol} ──────────────────────────────

    public function test_user_can_create_profile(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/connection-preferences/rdp', [
                'profile_name' => 'Work RDP',
                'is_default' => true,
                'parameters' => [
                    'port' => 3389,
                    'width' => 1920,
                    'height' => 1080,
                    'disable-wallpaper' => true,
                ],
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.protocol', 'rdp');
        $response->assertJsonPath('data.profile_name', 'Work RDP');
        $response->assertJsonPath('data.is_default', true);
        $response->assertJsonPath('data.parameters.port', 3389);

        $this->assertDatabaseHas('guacamole_connection_preferences', [
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Work RDP',
        ]);
    }

    public function test_cannot_create_duplicate_profile_name(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Work',
            'is_default' => true,
            'parameters' => [],
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/connection-preferences/rdp', [
                'profile_name' => 'Work',
                'parameters' => ['port' => 3389],
            ]);

        $response->assertUnprocessable();
    }

    // ─── PUT /connection-preferences/{protocol}/{profile} ─────────────────────

    public function test_user_can_update_profile(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Default',
            'is_default' => true,
            'parameters' => ['port' => 3389],
        ]);

        $response = $this->actingAs($this->user)
            ->putJson('/connection-preferences/rdp/Default', [
                'parameters' => ['port' => 13389, 'width' => 2560],
            ]);

        $response->assertOk();
        $response->assertJsonPath('data.parameters.port', 13389);
        $response->assertJsonPath('data.parameters.width', 2560);
    }

    public function test_update_nonexistent_profile_returns_404(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson('/connection-preferences/rdp/NonExistent', [
                'parameters' => ['port' => 3389],
            ]);

        $response->assertNotFound();
    }

    public function test_update_validates_port_range(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Default',
            'is_default' => true,
            'parameters' => [],
        ]);

        $response = $this->actingAs($this->user)
            ->putJson('/connection-preferences/rdp/Default', [
                'parameters' => ['port' => 99999], // invalid — max 65535
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('parameters.port');
    }

    public function test_update_validates_display_dimensions(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Default',
            'is_default' => true,
            'parameters' => [],
        ]);

        $response = $this->actingAs($this->user)
            ->putJson('/connection-preferences/rdp/Default', [
                'parameters' => ['width' => 100, 'height' => 50], // below min
            ]);

        $response->assertUnprocessable();
    }

    public function test_update_rejects_invalid_security_mode(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Default',
            'is_default' => true,
            'parameters' => [],
        ]);

        $response = $this->actingAs($this->user)
            ->putJson('/connection-preferences/rdp/Default', [
                'parameters' => ['security' => 'invalid-mode'],
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('parameters.security');
    }

    // ─── DELETE /connection-preferences/{protocol}/{profile} ──────────────────

    public function test_user_can_delete_profile(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'ToDelete',
            'is_default' => false,
            'parameters' => [],
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson('/connection-preferences/rdp/ToDelete');

        $response->assertOk();
        $this->assertDatabaseMissing('guacamole_connection_preferences', [
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'ToDelete',
        ]);
    }

    public function test_delete_nonexistent_profile_returns_404(): void
    {
        $response = $this->actingAs($this->user)
            ->deleteJson('/connection-preferences/rdp/NonExistent');

        $response->assertNotFound();
    }

    // ─── PATCH /connection-preferences/{protocol}/{profile}/default ───────────

    public function test_user_can_set_profile_as_default(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Work',
            'is_default' => true,
            'parameters' => [],
        ]);
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Home',
            'is_default' => false,
            'parameters' => [],
        ]);

        $response = $this->actingAs($this->user)
            ->patchJson('/connection-preferences/rdp/Home/default');

        $response->assertOk();

        // Home should now be default, Work should not
        $this->assertDatabaseHas('guacamole_connection_preferences', [
            'user_id' => $this->user->id,
            'profile_name' => 'Home',
            'is_default' => true,
        ]);
        $this->assertDatabaseHas('guacamole_connection_preferences', [
            'user_id' => $this->user->id,
            'profile_name' => 'Work',
            'is_default' => false,
        ]);
    }

    // ─── Protocol scoping ─────────────────────────────────────────────────────

    public function test_profiles_are_scoped_per_protocol(): void
    {
        // Create RDP profile
        $this->actingAs($this->user)
            ->postJson('/connection-preferences/rdp', [
                'profile_name' => 'Default',
                'is_default' => true,
                'parameters' => ['port' => 3389],
            ])
            ->assertCreated();

        // Create VNC profile with same name - should succeed
        $this->actingAs($this->user)
            ->postJson('/connection-preferences/vnc', [
                'profile_name' => 'Default',
                'is_default' => true,
                'parameters' => ['port' => 5901],
            ])
            ->assertCreated();

        // RDP and VNC profiles are stored separately
        $this->assertDatabaseCount('guacamole_connection_preferences', 2);
        $this->assertDatabaseHas('guacamole_connection_preferences', [
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Default',
        ]);
        $this->assertDatabaseHas('guacamole_connection_preferences', [
            'user_id' => $this->user->id,
            'vm_session_type' => 'vnc',
            'profile_name' => 'Default',
        ]);
    }
}
