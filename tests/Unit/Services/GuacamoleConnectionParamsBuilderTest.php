<?php

namespace Tests\Unit\Services;

use App\Enums\VMTemplateProtocol;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Models\ProxmoxNode;
use App\Services\GuacamoleConnectionParamsBuilder;
use Tests\TestCase;

class GuacamoleConnectionParamsBuilderTest extends TestCase
{
    public function test_build_rdp_connection_params(): void
    {
        $template = VMTemplate::factory()->windows()->create(['protocol' => VMTemplateProtocol::RDP]);
        $node = ProxmoxNode::factory()->create();
        $session = VMSession::factory()
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'ip_address' => '10.0.0.50',
            ]);

        $params = GuacamoleConnectionParamsBuilder::build($session);

        $this->assertEquals('rdp', $params['protocol']);
        $this->assertEquals("session-{$session->id}", $params['name']);
        $this->assertEquals('10.0.0.50', $params['parameters']['hostname']);
        $this->assertEquals('3389', $params['parameters']['port']);
        $this->assertNotEmpty($params['parameters']['username']);
        $this->assertNotEmpty($params['parameters']['password']);
    }

    public function test_build_vnc_connection_params(): void
    {
        $template = VMTemplate::factory()->linux()->create(['protocol' => VMTemplateProtocol::VNC]);
        $node = ProxmoxNode::factory()->create();
        $session = VMSession::factory()
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'ip_address' => '10.0.0.60',
            ]);

        $params = GuacamoleConnectionParamsBuilder::build($session);

        $this->assertEquals('vnc', $params['protocol']);
        $this->assertEquals('10.0.0.60', $params['parameters']['hostname']);
        $this->assertEquals('5900', $params['parameters']['port']);
    }

    public function test_build_ssh_connection_params(): void
    {
        $template = VMTemplate::factory()->linux()->create(['protocol' => VMTemplateProtocol::SSH]);
        $node = ProxmoxNode::factory()->create();
        $session = VMSession::factory()
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'ip_address' => '10.0.0.70',
            ]);

        $params = GuacamoleConnectionParamsBuilder::build($session);

        $this->assertEquals('ssh', $params['protocol']);
        $this->assertEquals('10.0.0.70', $params['parameters']['hostname']);
        $this->assertEquals('22', $params['parameters']['port']);
    }

    public function test_build_uses_localhost_when_ip_address_not_set(): void
    {
        $template = VMTemplate::factory()->windows()->create(['protocol' => VMTemplateProtocol::RDP]);
        $node = ProxmoxNode::factory()->create();
        $session = VMSession::factory()
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'ip_address' => null,
            ]);

        $params = GuacamoleConnectionParamsBuilder::build($session);

        $this->assertEquals('localhost', $params['parameters']['hostname']);
    }
}
