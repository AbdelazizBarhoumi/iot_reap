<?php

namespace Database\Factories;

use App\Enums\UsbDeviceStatus;
use App\Models\GatewayNode;
use App\Models\UsbDevice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UsbDevice>
 */
class UsbDeviceFactory extends Factory
{
    protected $model = UsbDevice::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $deviceCounter = 1;

        $deviceNumber = $deviceCounter++;

        return [
            'gateway_node_id' => GatewayNode::factory(),
            'busid' => "1-{$deviceNumber}",
            'vendor_id' => $this->faker->hexColor(),
            'product_id' => $this->faker->hexColor(),
            'name' => $this->faker->randomElement([
                'Samsung Galaxy (MTP mode)',
                'SanDisk Cruzer Blade',
                'Canon Printer',
                'Logitech USB Mouse',
                'Generic USB Hub',
            ]) . " #{$deviceNumber}",
            'status' => UsbDeviceStatus::AVAILABLE,
            'attached_to' => null,
            'attached_vm_ip' => null,
            'usbip_port' => null,
        ];
    }

    /**
     * Configure device as available.
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UsbDeviceStatus::AVAILABLE,
            'attached_to' => null,
            'attached_vm_ip' => null,
            'usbip_port' => null,
        ]);
    }

    /**
     * Configure device as bound.
     */
    public function bound(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UsbDeviceStatus::BOUND,
            'attached_to' => null,
            'attached_vm_ip' => null,
            'usbip_port' => null,
        ]);
    }

    /**
     * Configure device as attached to a VM.
     */
    public function attached(string $vmName = 'Windows-VM-1', string $vmIp = '192.168.50.100'): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UsbDeviceStatus::ATTACHED,
            'attached_to' => $vmName,
            'attached_vm_ip' => $vmIp,
            'usbip_port' => '00',
        ]);
    }

    /**
     * Configure as a specific device type.
     */
    public function asMouse(): static
    {
        return $this->state(fn (array $attributes) => [
            'vendor_id' => '0e0f',
            'product_id' => '0003',
            'name' => 'VMware Virtual Mouse',
        ]);
    }

    /**
     * Configure as a USB storage device.
     */
    public function asStorage(): static
    {
        return $this->state(fn (array $attributes) => [
            'vendor_id' => '0781',
            'product_id' => '5567',
            'name' => 'SanDisk Cruzer Blade',
        ]);
    }

    /**
     * Configure as a Samsung phone.
     */
    public function asPhone(): static
    {
        return $this->state(fn (array $attributes) => [
            'vendor_id' => '04e8',
            'product_id' => '6860',
            'name' => 'Samsung Galaxy (MTP mode)',
        ]);
    }
}
