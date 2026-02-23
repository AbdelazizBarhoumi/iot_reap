<?php

namespace Tests\Unit\Models;

use App\Enums\VMSessionProtocol;
use App\Models\VMSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VMSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_protocol_returns_enum(): void
    {
        $session = VMSession::factory()->create([
            'protocol' => VMSessionProtocol::RDP->value,
        ]);

        $protocol = $session->getProtocol();
        $this->assertInstanceOf(VMSessionProtocol::class, $protocol);
        $this->assertSame(VMSessionProtocol::RDP, $protocol);
    }

    public function test_get_effective_protocol_aliases_get_protocol(): void
    {
        $session = VMSession::factory()->create([
            'protocol' => VMSessionProtocol::VNC->value,
        ]);

        $this->assertSame(
            $session->getProtocol(),
            $session->getProtocol(),
        );
    }

    public function test_protocol_missing_throws_runtime_exception(): void
    {
        $this->expectException(\RuntimeException::class);

        $session = VMSession::factory()->create([
            'protocol' => null,
        ]);

        $session->getProtocol();
    }
}
