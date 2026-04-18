<?php

namespace Database\Seeders;

use App\Enums\UsbDeviceStatus;
use App\Models\GatewayNode;
use App\Models\ProxmoxServer;
use App\Models\UsbDevice;
use Illuminate\Database\Seeder;

/**
 * Seeds gateway nodes and USB devices for hardware management.
 */
class HardwareSeeder extends Seeder
{
    public function run(): void
    {
        $servers = ProxmoxServer::all();

        if ($servers->isEmpty()) {
            $this->command->warn('No Proxmox servers found. Skipping hardware setup.');
            return;
        }

        // ── Create gateway nodes (USB/IP gateways) ──
        $gatewayNodes = [];
        for ($i = 1; $i <= 3; $i++) {
            $node = GatewayNode::create([
                'name' => "gateway-node-{$i}",
                'ip' => "192.168.100.{$i}",
                'port' => 3240,
                'online' => $i !== 3,
                'is_verified' => true,
                'proxmox_vmid' => "10{$i}",
                'proxmox_node' => 'proxmox-node-1',
                'last_seen_at' => now()->subMinutes(rand(0, 60)),
            ]);
            $gatewayNodes[] = $node;
        }

        // ── Create USB devices for each gateway ──
        $deviceTypes = ['Oscilloscope', 'Logic Analyzer', 'USB Drive', 'Network Interface', 'PLC Module'];

        foreach ($gatewayNodes as $gateway) {
            $deviceCount = rand(2, 5);
            for ($i = 0; $i < $deviceCount; $i++) {
                $status = [
                    UsbDeviceStatus::AVAILABLE,
                    UsbDeviceStatus::AVAILABLE,
                    'bound',
                    'attached',
                ][array_rand([0, 1, 2, 3])];

                UsbDevice::create([
                    'gateway_node_id' => $gateway->id,
                    'busid' => "1-{$i}." . rand(1, 5),
                    'vendor_id' => strtolower(bin2hex(random_bytes(2))),
                    'product_id' => strtolower(bin2hex(random_bytes(2))),
                    'name' => $deviceTypes[$i % count($deviceTypes)] . " #{$i}",
                    'status' => $status,
                    'is_camera' => false,
                ]);
            }
        }

        $this->command->info('Seeded gateway nodes and USB devices.');
    }
}
