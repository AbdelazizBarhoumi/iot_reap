<?php

namespace Tests\Unit\Services;

use App\Enums\VMSessionProtocol;
use App\Models\ProxmoxNode;
use App\Models\User;
use App\Models\VMSession;
use App\Repositories\UserConnectionPreferenceRepository;
use App\Repositories\UserVMConnectionDefaultProfileRepository;
use App\Services\GuacamoleConnectionParamsBuilder;
use RuntimeException;
use Tests\TestCase;

/**
 * Tests for GuacamoleConnectionParamsBuilder.
 *
 * Key invariants:
 *  - hostname is ALWAYS $session->ip_address (VM's DHCP IP), never overridable
 *  - user's saved settings override sensible defaults
 *  - all 3 protocols produce valid params arrays
 */
class GuacamoleConnectionParamsBuilderTest extends TestCase
{
    private GuacamoleConnectionParamsBuilder $builder;

    private UserConnectionPreferenceRepository $prefRepo;

    private UserVMConnectionDefaultProfileRepository $vmDefaultRepo;

    protected function setUp(): void
    {
        parent::setUp();

        $this->prefRepo = new UserConnectionPreferenceRepository;
        $this->vmDefaultRepo = new UserVMConnectionDefaultProfileRepository;
        $this->builder = new GuacamoleConnectionParamsBuilder($this->prefRepo, $this->vmDefaultRepo);
    }

    // ─── RDP ─────────────────────────────────────────────────────────────────

    public function test_builds_rdp_params_with_sensible_defaults(): void
    {
        $user = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMSessionProtocol::RDP, '10.0.0.50');

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('rdp', $params['protocol']);
        $this->assertEquals("session-{$session->id}", $params['name']);
        $this->assertEquals('10.0.0.50', $params['parameters']['hostname']);
        $this->assertEquals('3389', $params['parameters']['port']);
        $this->assertEquals('false', $params['parameters']['enable-wallpaper']);
        $this->assertEquals('false', $params['parameters']['disable-audio']);
    }

    public function test_rdp_applies_user_saved_settings_over_defaults(): void
    {
        $user = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMSessionProtocol::RDP, '10.0.0.51');

        // Save user preferences (custom port and display size)
        // save as the default profile so findByUser() will pick it up
        $this->prefRepo->save($user, 'rdp', [
            'port' => 13389,
            'width' => 1920,
            'height' => 1080,
            'username' => 'john',
            'enable-printing' => true,
            'enable-wallpaper' => true,
        ], 'Default', true);

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('10.0.0.51', $params['parameters']['hostname']); // Never overridable
        $this->assertEquals('13389', $params['parameters']['port']);
        $this->assertEquals('1920', $params['parameters']['width']);
        $this->assertEquals('1080', $params['parameters']['height']);
        $this->assertEquals('john', $params['parameters']['username']);
        $this->assertEquals('true', $params['parameters']['enable-printing']);
        $this->assertEquals('true', $params['parameters']['enable-wallpaper']);
    }

    public function test_rdp_user_cannot_override_hostname(): void
    {
        $user = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMSessionProtocol::RDP, '10.0.0.52');

        // Attempt to override hostname via user preferences
        $this->prefRepo->save($user, 'rdp', [
            'hostname' => '1.2.3.4', // Should be ignored
        ]);

        $params = $this->builder->buildParams($session, $user);

        // Hostname must always be the VM's actual IP
        $this->assertEquals('10.0.0.52', $params['parameters']['hostname']);
    }

    // ─── VNC ─────────────────────────────────────────────────────────────────

    public function test_builds_vnc_params_with_sensible_defaults(): void
    {
        $user = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMSessionProtocol::VNC, '10.0.0.60');

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('vnc', $params['protocol']);
        $this->assertEquals('10.0.0.60', $params['parameters']['hostname']);
        $this->assertEquals('5900', $params['parameters']['port']);
    }

    public function test_vnc_applies_user_settings(): void
    {
        $user = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMSessionProtocol::VNC, '10.0.0.61');

        $this->prefRepo->save($user, 'vnc', [
            'port' => 5901,
            'password' => 'mypass',
        ], 'Default', true);

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('5901', $params['parameters']['port']);
        $this->assertEquals('mypass', $params['parameters']['password']);
        $this->assertEquals('10.0.0.61', $params['parameters']['hostname']);
    }

    // ─── SSH ─────────────────────────────────────────────────────────────────

    public function test_builds_ssh_params_with_sensible_defaults(): void
    {
        $user = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMSessionProtocol::SSH, '10.0.0.70');

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('ssh', $params['protocol']);
        $this->assertEquals('10.0.0.70', $params['parameters']['hostname']);
        $this->assertEquals('22', $params['parameters']['port']);
        $this->assertEquals('true', $params['parameters']['enable-sftp']);
    }

    public function test_ssh_applies_user_settings(): void
    {
        $user = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMSessionProtocol::SSH, '10.0.0.71');

        $this->prefRepo->save($user, 'ssh', [
            'port' => 2222,
            'username' => 'deploy',
        ], 'Default', true);

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('2222', $params['parameters']['port']);
        $this->assertEquals('deploy', $params['parameters']['username']);
        $this->assertEquals('10.0.0.71', $params['parameters']['hostname']);
    }

    // ─── Edge cases ──────────────────────────────────────────────────────────

    public function test_throws_when_ip_address_is_null(): void
    {
        $user = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMSessionProtocol::RDP, null);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessageMatches('/ip_address is null/');

        $this->builder->buildParams($session, $user);
    }

    public function test_boolean_user_settings_cast_to_guacamole_string_format(): void
    {
        $user = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMSessionProtocol::RDP, '10.0.0.80');

        $this->prefRepo->save($user, 'rdp', [
            'console-audio' => true,
            'enable-printing' => false,
        ], 'Default', true);

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('true', $params['parameters']['console-audio']);
        $this->assertEquals('false', $params['parameters']['enable-printing']);
    }

    public function test_uses_session_selected_profile_over_protocol_default(): void
    {
        $user = User::factory()->engineer()->create();

        // Protocol default profile
        $this->prefRepo->save(
            user: $user,
            sessionType: 'rdp',
            params: [
                'port' => 3389,
                'width' => 1280,
            ],
            profileName: 'Default',
            isDefault: true,
        );

        // Non-default profile that the session explicitly selects
        $this->prefRepo->save(
            user: $user,
            sessionType: 'rdp',
            params: [
                'port' => 3399,
                'width' => 1920,
            ],
            profileName: 'Lab High Res',
            isDefault: false,
        );

        $session = $this->makeSession(
            user: $user,
            protocol: VMSessionProtocol::RDP,
            ip: '10.0.0.81',
            connectionProfileName: 'Lab High Res',
        );

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('3399', $params['parameters']['port']);
        $this->assertEquals('1920', $params['parameters']['width']);
        $this->assertEquals('10.0.0.81', $params['parameters']['hostname']);
    }

    public function test_falls_back_to_default_when_selected_profile_is_missing(): void
    {
        $user = User::factory()->engineer()->create();

        $this->prefRepo->save(
            user: $user,
            sessionType: 'rdp',
            params: [
                'port' => 13389,
                'width' => 1600,
            ],
            profileName: 'Default',
            isDefault: true,
        );

        $session = $this->makeSession(
            user: $user,
            protocol: VMSessionProtocol::RDP,
            ip: '10.0.0.82',
            connectionProfileName: 'Profile That Does Not Exist',
        );

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('13389', $params['parameters']['port']);
        $this->assertEquals('1600', $params['parameters']['width']);
        $this->assertEquals('10.0.0.82', $params['parameters']['hostname']);
    }

    public function test_uses_per_vm_default_over_protocol_default(): void
    {
        $user = User::factory()->engineer()->create();

        // Protocol default profile (1280x720)
        $this->prefRepo->save(
            user: $user,
            sessionType: 'rdp',
            params: [
                'port' => 3389,
                'width' => 1280,
                'height' => 720,
            ],
            profileName: 'Default',
            isDefault: true,
        );

        // VM-specific preferred profile (1920x1080)
        $this->prefRepo->save(
            user: $user,
            sessionType: 'rdp',
            params: [
                'port' => 3389,
                'width' => 1920,
                'height' => 1080,
            ],
            profileName: 'Lab High Res',
            isDefault: false,
        );

        // Set VM-specific default for VM 201
        $this->vmDefaultRepo->setPerVMDefault(
            user: $user,
            vmId: 201,
            protocol: 'rdp',
            profileName: 'Lab High Res',
        );

        $session = $this->makeSession(
            user: $user,
            protocol: VMSessionProtocol::RDP,
            ip: '10.0.0.83',
            vmId: 201,
        );

        $params = $this->builder->buildParams($session, $user);

        // Should use per-VM default (1920x1080) not protocol default (1280x720)
        $this->assertEquals('3389', $params['parameters']['port']);
        $this->assertEquals('1920', $params['parameters']['width']);
        $this->assertEquals('1080', $params['parameters']['height']);
    }

    public function test_session_selection_overrides_per_vm_default(): void
    {
        $user = User::factory()->engineer()->create();

        // Protocol default (1280x720)
        $this->prefRepo->save(
            user: $user,
            sessionType: 'rdp',
            params: [
                'port' => 3389,
                'width' => 1280,
                'height' => 720,
            ],
            profileName: 'Default',
            isDefault: true,
        );

        // VM-specific preferred (1920x1080)
        $this->prefRepo->save(
            user: $user,
            sessionType: 'rdp',
            params: [
                'port' => 3389,
                'width' => 1920,
                'height' => 1080,
            ],
            profileName: 'Lab High Res',
            isDefault: false,
        );

        // Portable profile (1600x900)
        $this->prefRepo->save(
            user: $user,
            sessionType: 'rdp',
            params: [
                'port' => 3389,
                'width' => 1600,
                'height' => 900,
            ],
            profileName: 'Portable',
            isDefault: false,
        );

        // Set VM-specific default to Lab High Res
        $this->vmDefaultRepo->setPerVMDefault(
            user: $user,
            vmId: 202,
            protocol: 'rdp',
            profileName: 'Lab High Res',
        );

        // But user selects Portable during this session launch
        $session = $this->makeSession(
            user: $user,
            protocol: VMSessionProtocol::RDP,
            ip: '10.0.0.84',
            vmId: 202,
            connectionProfileName: 'Portable',
        );

        $params = $this->builder->buildParams($session, $user);

        // Session selection should override per-VM default
        $this->assertEquals('1600', $params['parameters']['width']);
        $this->assertEquals('900', $params['parameters']['height']);
    }

    public function test_falls_back_to_protocol_default_when_per_vm_default_missing(): void
    {
        $user = User::factory()->engineer()->create();

        // Protocol default
        $this->prefRepo->save(
            user: $user,
            sessionType: 'rdp',
            params: [
                'port' => 3389,
                'width' => 1280,
            ],
            profileName: 'Default',
            isDefault: true,
        );

        // No per-VM default set for VM 203

        $session = $this->makeSession(
            user: $user,
            protocol: VMSessionProtocol::RDP,
            ip: '10.0.0.85',
            vmId: 203,
        );

        $params = $this->builder->buildParams($session, $user);

        // Should fall back to protocol default
        $this->assertEquals('3389', $params['parameters']['port']);
        $this->assertEquals('1280', $params['parameters']['width']);
    }

    public function test_per_vm_default_does_not_apply_when_vm_id_is_null(): void
    {
        $user = User::factory()->engineer()->create();

        // Protocol default
        $this->prefRepo->save(
            user: $user,
            sessionType: 'rdp',
            params: [
                'port' => 3389,
                'width' => 1280,
            ],
            profileName: 'Default',
            isDefault: true,
        );

        // VM-specific preferred (if VM had an ID)
        $this->prefRepo->save(
            user: $user,
            sessionType: 'rdp',
            params: [
                'port' => 3389,
                'width' => 1920,
            ],
            profileName: 'Lab High Res',
            isDefault: false,
        );

        // Session with no VM ID (shouldn't happen in practice but test boundary)
        $session = $this->makeSession(
            user: $user,
            protocol: VMSessionProtocol::RDP,
            ip: '10.0.0.86',
            vmId: null,
        );

        $params = $this->builder->buildParams($session, $user);

        // Should use protocol default even if per-VM defaults exist elsewhere
        $this->assertEquals('1280', $params['parameters']['width']);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private function makeSession(
        User $user,
        VMSessionProtocol $protocol,
        ?string $ip,
        ?string $connectionProfileName = null,
        ?int $vmId = null,
    ): VMSession {
        $node = ProxmoxNode::factory()->create();

        return VMSession::factory()
            ->for($user)
            ->create([
                'node_id' => $node->id,
                'ip_address' => $ip,
                'protocol' => $protocol->value,
                'connection_profile_name' => $connectionProfileName,
                'vm_id' => $vmId ?? 100 + random_int(1, 100),
            ]);
    }
}
