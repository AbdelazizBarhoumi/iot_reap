<?php

namespace Tests\Feature\Security;

use App\Models\GuacamoleConnectionPreference;
use App\Models\User;
use Tests\TestCase;

/**
 * IDOR security tests for ConnectionPreferencesController.
 *
 * Verifies that users cannot delete, access, or modify connection
 * preferences belonging to other users.
 */
class ConnectionPreferencesIdorTest extends TestCase
{
    private User $user;

    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->engineer()->create();
        $this->otherUser = User::factory()->engineer()->create();
    }

    public function test_user_cannot_delete_another_users_profile(): void
    {
        // Create a profile for another user
        GuacamoleConnectionPreference::create([
            'user_id' => $this->otherUser->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'PrivateProfile',
            'is_default' => true,
            'parameters' => ['port' => 3389],
        ]);

        // Attempt to delete another user's profile
        $response = $this->actingAs($this->user)
            ->deleteJson('/connection-preferences/rdp/PrivateProfile');

        // Should return 404 since the query is scoped to authenticated user
        $response->assertNotFound();

        // Verify the profile still exists
        $this->assertDatabaseHas('guacamole_connection_preferences', [
            'user_id' => $this->otherUser->id,
            'profile_name' => 'PrivateProfile',
        ]);
    }

    public function test_user_can_delete_own_profile(): void
    {
        // Create a profile for the authenticated user
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'MyProfile',
            'is_default' => true,
            'parameters' => ['port' => 3389],
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson('/connection-preferences/rdp/MyProfile');

        $response->assertOk();

        // Verify the profile was deleted
        $this->assertDatabaseMissing('guacamole_connection_preferences', [
            'user_id' => $this->user->id,
            'profile_name' => 'MyProfile',
        ]);
    }

    public function test_user_cannot_update_another_users_profile(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->otherUser->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'OtherProfile',
            'is_default' => true,
            'parameters' => ['port' => 3389],
        ]);

        $response = $this->actingAs($this->user)
            ->putJson('/connection-preferences/rdp/OtherProfile', [
                'parameters' => ['port' => 9999],
            ]);

        $response->assertNotFound();

        // Verify the profile was not modified
        $this->assertDatabaseHas('guacamole_connection_preferences', [
            'user_id' => $this->otherUser->id,
            'profile_name' => 'OtherProfile',
        ]);
    }

    public function test_user_cannot_set_another_users_profile_as_default(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->otherUser->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'OtherDefault',
            'is_default' => false,
            'parameters' => ['port' => 3389],
        ]);

        $response = $this->actingAs($this->user)
            ->patchJson('/connection-preferences/rdp/OtherDefault/default');

        $response->assertNotFound();
    }

    public function test_user_cannot_view_another_users_profiles(): void
    {
        // Create profile for other user
        GuacamoleConnectionPreference::create([
            'user_id' => $this->otherUser->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'SecretProfile',
            'is_default' => true,
            'parameters' => ['port' => 3389],
        ]);

        // Create profile for authenticated user
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'MyProfile',
            'is_default' => true,
            'parameters' => ['port' => 3390],
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/connection-preferences/rdp');

        $response->assertOk();

        // Should only see own profiles, not other user's
        $profiles = $response->json('data.profiles');
        $this->assertCount(1, $profiles);
        $this->assertEquals('MyProfile', $profiles[0]['profile_name']);
    }

    public function test_unauthenticated_user_cannot_delete_profile(): void
    {
        GuacamoleConnectionPreference::create([
            'user_id' => $this->user->id,
            'vm_session_type' => 'rdp',
            'profile_name' => 'Test',
            'is_default' => true,
            'parameters' => [],
        ]);

        $response = $this->deleteJson('/connection-preferences/rdp/Test');

        $response->assertUnauthorized();
    }
}
