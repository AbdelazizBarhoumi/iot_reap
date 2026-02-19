<?php

namespace Tests\Feature\Database;

use App\Models\ProxmoxNode;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Enums\ProxmoxNodeStatus;
use App\Enums\VMTemplateOSType;
use App\Enums\VMTemplateProtocol;
use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class US06MigrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that all tables are created.
     */
    public function test_proxmox_nodes_table_exists(): void
    {
        $this->assertTrue(
            \Illuminate\Support\Facades\Schema::hasTable('proxmox_nodes'),
            'proxmox_nodes table does not exist'
        );
    }

    public function test_vm_templates_table_exists(): void
    {
        $this->assertTrue(
            \Illuminate\Support\Facades\Schema::hasTable('vm_templates'),
            'vm_templates table does not exist'
        );
    }

    public function test_vm_sessions_table_exists(): void
    {
        $this->assertTrue(
            \Illuminate\Support\Facades\Schema::hasTable('vm_sessions'),
            'vm_sessions table does not exist'
        );
    }

    /**
     * Test that required columns exist.
     */
    public function test_proxmox_nodes_has_required_columns(): void
    {
        $this->assertTrue(
            \Illuminate\Support\Facades\Schema::hasColumns('proxmox_nodes', [
                'id', 'name', 'hostname', 'api_url', 'status', 'max_vms', 'created_at', 'updated_at'
            ]),
            'proxmox_nodes table missing required columns'
        );
    }

    public function test_vm_templates_has_required_columns(): void
    {
        $this->assertTrue(
            \Illuminate\Support\Facades\Schema::hasColumns('vm_templates', [
                'id', 'name', 'os_type', 'protocol', 'template_vmid', 'cpu_cores', 'ram_mb', 'disk_gb', 'tags', 'is_active', 'created_at', 'updated_at'
            ]),
            'vm_templates table missing required columns'
        );
    }

    public function test_vm_sessions_has_required_columns(): void
    {
        $this->assertTrue(
            \Illuminate\Support\Facades\Schema::hasColumns('vm_sessions', [
                'id', 'user_id', 'template_id', 'node_id', 'vm_id', 'status', 'ip_address', 'session_type', 'expires_at', 'guacamole_connection_id', 'created_at', 'updated_at'
            ]),
            'vm_sessions table missing required columns'
        );
    }

    /**
     * Test factories can create models.
     */
    public function test_proxmox_node_factory_creates_model(): void
    {
        $node = ProxmoxNode::factory()->create();

        $this->assertDatabaseHas('proxmox_nodes', [
            'id' => $node->id,
            'name' => $node->name,
            'hostname' => $node->hostname,
        ]);
    }

    public function test_vm_template_factory_creates_model(): void
    {
        $template = VMTemplate::factory()->windows11()->create();

        $this->assertDatabaseHas('vm_templates', [
            'id' => $template->id,
            'name' => 'Windows 11',
            'os_type' => VMTemplateOSType::WINDOWS->value,
        ]);
    }

    public function test_vm_session_factory_creates_model(): void
    {
        $session = VMSession::factory()->active()->create();

        $this->assertDatabaseHas('vm_sessions', [
            'id' => $session->id,
            'user_id' => $session->user_id,
        ]);
    }

    /**
     * Test model relationships.
     */
    public function test_vm_session_belongs_to_user(): void
    {
        $session = VMSession::factory()->create();

        $this->assertNotNull($session->user);
        $this->assertInstanceOf(\App\Models\User::class, $session->user);
    }

    public function test_vm_session_belongs_to_template(): void
    {
        $session = VMSession::factory()->create();

        $this->assertNotNull($session->template);
        $this->assertInstanceOf(VMTemplate::class, $session->template);
    }

    public function test_vm_session_belongs_to_node(): void
    {
        $session = VMSession::factory()->create();

        $this->assertNotNull($session->node);
        $this->assertInstanceOf(ProxmoxNode::class, $session->node);
    }

    /**
     * Test enums work correctly.
     */
    public function test_proxmox_node_status_enum(): void
    {
        $node = ProxmoxNode::factory()->online()->create();

        $this->assertEquals(ProxmoxNodeStatus::ONLINE, $node->status);
        $this->assertEquals('online', $node->status->value);
    }

    public function test_vm_template_os_type_enum(): void
    {
        $template = VMTemplate::factory()->windows11()->create();

        $this->assertEquals(VMTemplateOSType::WINDOWS, $template->os_type);
        $this->assertEquals('windows', $template->os_type->value);
    }

    public function test_vm_template_protocol_enum(): void
    {
        $template = VMTemplate::factory()->windows11()->create();

        $this->assertEquals(VMTemplateProtocol::RDP, $template->protocol);
        $this->assertEquals('rdp', $template->protocol->value);
    }

    public function test_vm_session_status_enum(): void
    {
        $session = VMSession::factory()->active()->create();

        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
        $this->assertEquals('active', $session->status->value);
    }

    public function test_vm_session_type_enum(): void
    {
        $session = VMSession::factory()->persistent()->create();

        $this->assertEquals(VMSessionType::PERSISTENT, $session->session_type);
        $this->assertEquals('persistent', $session->session_type->value);
    }

    /**
     * Test seeded data exists.
     */
    public function test_seeder_creates_proxmox_nodes(): void
    {
        // Run the database seeder
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        // The seeder should create 7 nodes
        $this->assertGreaterThanOrEqual(7, ProxmoxNode::count());
    }

    public function test_seeder_creates_vm_templates(): void
    {
        // Run the database seeder
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        // The seeder should create 3 templates
        $this->assertGreaterThanOrEqual(3, VMTemplate::count());
        
        // Should have Windows 11, Ubuntu 22.04 LTS, and Kali Linux Rolling
        $this->assertTrue(VMTemplate::where('name', 'Windows 11')->exists());
        $this->assertTrue(VMTemplate::where('name', 'Ubuntu 22.04 LTS')->exists());
        $this->assertTrue(VMTemplate::where('name', 'Kali Linux Rolling')->exists());
    }

    public function test_seeder_creates_vm_sessions(): void
    {
        // Run the database seeder
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        // The seeder should create 2 demo sessions
        $this->assertGreaterThanOrEqual(2, VMSession::count());
    }
}
