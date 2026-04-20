<?php

namespace Tests\Unit\Repositories;

use App\Models\User;
use App\Models\UserVMConnectionDefaultProfile;
use App\Repositories\UserVMConnectionDefaultProfileRepository;
use Tests\TestCase;

class UserVMConnectionDefaultProfileRepositoryTest extends TestCase
{
    private UserVMConnectionDefaultProfileRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = new UserVMConnectionDefaultProfileRepository;
    }

    public function test_find_per_vm_default_returns_null_when_not_set(): void
    {
        $user = User::factory()->engineer()->create();

        $result = $this->repository->findPerVMDefault(
            user: $user,
            vmId: 201,
            protocol: 'rdp',
        );

        $this->assertNull($result);
    }

    public function test_set_per_vm_default_creates_new_record(): void
    {
        $user = User::factory()->engineer()->create();

        $result = $this->repository->setPerVMDefault(
            user: $user,
            vmId: 201,
            protocol: 'rdp',
            profileName: 'Lab High Res',
        );

        $this->assertNotNull($result->id);
        $this->assertEquals($user->id, $result->user_id);
        $this->assertEquals(201, $result->vm_id);
        $this->assertEquals('rdp', $result->vm_session_protocol);
        $this->assertEquals('Lab High Res', $result->preferred_profile_name);

        // Verify database record
        $this->assertDatabaseHas('user_vm_connection_default_profiles', [
            'user_id' => $user->id,
            'vm_id' => 201,
            'vm_session_protocol' => 'rdp',
            'preferred_profile_name' => 'Lab High Res',
        ]);
    }

    public function test_set_per_vm_default_updates_existing_record(): void
    {
        $user = User::factory()->engineer()->create();

        // Create initial default
        $this->repository->setPerVMDefault(
            user: $user,
            vmId: 201,
            protocol: 'rdp',
            profileName: 'Lab High Res',
        );

        // Update to different profile
        $result = $this->repository->setPerVMDefault(
            user: $user,
            vmId: 201,
            protocol: 'rdp',
            profileName: 'Portable',
        );

        // Should still be 1 record
        $count = UserVMConnectionDefaultProfile::where('user_id', $user->id)
            ->where('vm_id', 201)
            ->where('vm_session_protocol', 'rdp')
            ->count();
        $this->assertEquals(1, $count);

        // Profile name should be updated
        $this->assertEquals('Portable', $result->preferred_profile_name);
    }

    public function test_find_per_vm_default_returns_set_record(): void
    {
        $user = User::factory()->engineer()->create();

        $this->repository->setPerVMDefault(
            user: $user,
            vmId: 202,
            protocol: 'vnc',
            profileName: 'Standard',
        );

        $result = $this->repository->findPerVMDefault(
            user: $user,
            vmId: 202,
            protocol: 'vnc',
        );

        $this->assertNotNull($result);
        $this->assertEquals('Standard', $result->preferred_profile_name);
    }

    public function test_delete_per_vm_default_removes_record(): void
    {
        $user = User::factory()->engineer()->create();

        $this->repository->setPerVMDefault(
            user: $user,
            vmId: 203,
            protocol: 'ssh',
            profileName: 'Default',
        );

        $deleted = $this->repository->deletePerVMDefault(
            user: $user,
            vmId: 203,
            protocol: 'ssh',
        );

        $this->assertTrue($deleted);
        $this->assertNull(
            $this->repository->findPerVMDefault(
                user: $user,
                vmId: 203,
                protocol: 'ssh',
            )
        );
    }

    public function test_delete_per_vm_default_returns_false_when_not_found(): void
    {
        $user = User::factory()->engineer()->create();

        $deleted = $this->repository->deletePerVMDefault(
            user: $user,
            vmId: 204,
            protocol: 'rdp',
        );

        $this->assertFalse($deleted);
    }

    public function test_find_all_by_user_returns_all_defaults(): void
    {
        $user = User::factory()->engineer()->create();
        $otherUser = User::factory()->engineer()->create();

        // Set defaults for user
        $this->repository->setPerVMDefault($user, 201, 'rdp', 'Lab High Res');
        $this->repository->setPerVMDefault($user, 202, 'rdp', 'Portable');
        $this->repository->setPerVMDefault($user, 201, 'vnc', 'Standard');

        // Set defaults for other user (should not be returned)
        $this->repository->setPerVMDefault($otherUser, 201, 'rdp', 'Some Profile');

        $results = $this->repository->findAllByUser($user);

        $this->assertCount(3, $results);
        foreach ($results as $result) {
            $this->assertEquals($user->id, $result->user_id);
        }
    }

    public function test_find_all_by_user_and_vm_returns_protocol_defaults(): void
    {
        $user = User::factory()->engineer()->create();

        $this->repository->setPerVMDefault($user, 205, 'rdp', 'Lab High Res');
        $this->repository->setPerVMDefault($user, 205, 'vnc', 'Standard');
        $this->repository->setPerVMDefault($user, 206, 'rdp', 'Portable');

        $results = $this->repository->findAllByUserAndVM($user, 205);

        $this->assertCount(2, $results);
        $this->assertTrue($results->contains('vm_session_protocol', 'rdp'));
        $this->assertTrue($results->contains('vm_session_protocol', 'vnc'));
    }

    public function test_per_vm_defaults_scoped_per_user(): void
    {
        $user1 = User::factory()->engineer()->create();
        $user2 = User::factory()->engineer()->create();

        // Both users set default for same VM
        $this->repository->setPerVMDefault($user1, 207, 'rdp', 'User1 Profile');
        $this->repository->setPerVMDefault($user2, 207, 'rdp', 'User2 Profile');

        // Each should get their own
        $user1Default = $this->repository->findPerVMDefault($user1, 207, 'rdp');
        $user2Default = $this->repository->findPerVMDefault($user2, 207, 'rdp');

        $this->assertEquals('User1 Profile', $user1Default->preferred_profile_name);
        $this->assertEquals('User2 Profile', $user2Default->preferred_profile_name);
    }

    public function test_per_vm_defaults_independent_per_protocol(): void
    {
        $user = User::factory()->engineer()->create();

        // Set different defaults per protocol for same VM
        $this->repository->setPerVMDefault($user, 208, 'rdp', 'RDP Profile');
        $this->repository->setPerVMDefault($user, 208, 'vnc', 'VNC Profile');
        $this->repository->setPerVMDefault($user, 208, 'ssh', 'SSH Profile');

        $rdpDefault = $this->repository->findPerVMDefault($user, 208, 'rdp');
        $vncDefault = $this->repository->findPerVMDefault($user, 208, 'vnc');
        $sshDefault = $this->repository->findPerVMDefault($user, 208, 'ssh');

        $this->assertEquals('RDP Profile', $rdpDefault->preferred_profile_name);
        $this->assertEquals('VNC Profile', $vncDefault->preferred_profile_name);
        $this->assertEquals('SSH Profile', $sshDefault->preferred_profile_name);
    }
}
