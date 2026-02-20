<?php

namespace Tests\Unit\Services;

use App\Enums\VMTemplateProtocol;
use App\Models\GuacamoleConnectionPreference;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Models\ProxmoxNode;
use App\Repositories\UserConnectionPreferenceRepository;
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

    protected function setUp(): void
    {
        parent::setUp();

        $this->prefRepo = new UserConnectionPreferenceRepository();
        $this->builder  = new GuacamoleConnectionParamsBuilder($this->prefRepo);
    }

    // ─── RDP ─────────────────────────────────────────────────────────────────

    public function test_builds_rdp_params_with_sensible_defaults(): void
    {
        $user    = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMTemplateProtocol::RDP, '10.0.0.50');

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('rdp', $params['protocol']);
        $this->assertEquals("session-{$session->id}", $params['name']);
        $this->assertEquals('10.0.0.50', $params['parameters']['hostname']);
        $this->assertEquals('3389', $params['parameters']['port']);
        $this->assertEquals('true', $params['parameters']['disable-wallpaper']);
        $this->assertEquals('true', $params['parameters']['enable-audio']);
    }

    public function test_rdp_applies_user_saved_settings_over_defaults(): void
    {
        $user    = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMTemplateProtocol::RDP, '10.0.0.51');

        // Save user preferences (custom port and display size)
        $this->prefRepo->save($user, 'rdp', [
            'port'             => 13389,
            'width'            => 1920,
            'height'           => 1080,
            'username'         => 'john',
            'enable-printing'  => true,
            'disable-wallpaper' => false,
        ]);

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('10.0.0.51', $params['parameters']['hostname']); // Never overridable
        $this->assertEquals('13389', $params['parameters']['port']);
        $this->assertEquals('1920', $params['parameters']['width']);
        $this->assertEquals('1080', $params['parameters']['height']);
        $this->assertEquals('john', $params['parameters']['username']);
        $this->assertEquals('true', $params['parameters']['enable-printing']);
        $this->assertEquals('false', $params['parameters']['disable-wallpaper']);
    }

    public function test_rdp_user_cannot_override_hostname(): void
    {
        $user    = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMTemplateProtocol::RDP, '10.0.0.52');

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
        $user    = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMTemplateProtocol::VNC, '10.0.0.60');

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('vnc', $params['protocol']);
        $this->assertEquals('10.0.0.60', $params['parameters']['hostname']);
        $this->assertEquals('5900', $params['parameters']['port']);
    }

    public function test_vnc_applies_user_settings(): void
    {
        $user    = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMTemplateProtocol::VNC, '10.0.0.61');

        $this->prefRepo->save($user, 'vnc', [
            'port'     => 5901,
            'password' => 'mypass',
        ]);

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('5901', $params['parameters']['port']);
        $this->assertEquals('mypass', $params['parameters']['password']);
        $this->assertEquals('10.0.0.61', $params['parameters']['hostname']);
    }

    // ─── SSH ─────────────────────────────────────────────────────────────────

    public function test_builds_ssh_params_with_sensible_defaults(): void
    {
        $user    = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMTemplateProtocol::SSH, '10.0.0.70');

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('ssh', $params['protocol']);
        $this->assertEquals('10.0.0.70', $params['parameters']['hostname']);
        $this->assertEquals('22', $params['parameters']['port']);
        $this->assertEquals('true', $params['parameters']['enable-sftp']);
    }

    public function test_ssh_applies_user_settings(): void
    {
        $user    = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMTemplateProtocol::SSH, '10.0.0.71');

        $this->prefRepo->save($user, 'ssh', [
            'port'     => 2222,
            'username' => 'deploy',
        ]);

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('2222', $params['parameters']['port']);
        $this->assertEquals('deploy', $params['parameters']['username']);
        $this->assertEquals('10.0.0.71', $params['parameters']['hostname']);
    }

    // ─── Edge cases ──────────────────────────────────────────────────────────

    public function test_throws_when_ip_address_is_null(): void
    {
        $user    = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMTemplateProtocol::RDP, null);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessageMatches('/ip_address is null/');

        $this->builder->buildParams($session, $user);
    }

    public function test_boolean_user_settings_cast_to_guacamole_string_format(): void
    {
        $user    = User::factory()->engineer()->create();
        $session = $this->makeSession($user, VMTemplateProtocol::RDP, '10.0.0.80');

        $this->prefRepo->save($user, 'rdp', [
            'enable-audio'   => true,
            'enable-printing' => false,
        ]);

        $params = $this->builder->buildParams($session, $user);

        $this->assertEquals('true', $params['parameters']['enable-audio']);
        $this->assertEquals('false', $params['parameters']['enable-printing']);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private function makeSession(User $user, VMTemplateProtocol $protocol, ?string $ip): VMSession
    {
        $template = VMTemplate::factory()->create(['protocol' => $protocol]);
        $node     = ProxmoxNode::factory()->create();

        return VMSession::factory()
            ->for($user)
            ->create([
                'template_id' => $template->id,
                'node_id'     => $node->id,
                'ip_address'  => $ip,
            ]);
    }
}
