<?php

namespace Database\Factories;

use App\Enums\VMTemplateOSType;
use App\Enums\VMTemplateProtocol;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VMTemplate>
 */
class VMTemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word() . '-' . fake()->unique()->numberBetween(1000, 9999),
            'os_type' => fake()->randomElement([VMTemplateOSType::WINDOWS, VMTemplateOSType::LINUX])->value,
            'protocol' => VMTemplateProtocol::RDP->value,
            'template_vmid' => fake()->unique()->numberBetween(100, 199),
            'cpu_cores' => fake()->randomElement([2, 4, 8]),
            'ram_mb' => fake()->randomElement([2048, 4096, 8192]),
            'disk_gb' => fake()->randomElement([40, 80, 120]),
            'tags' => ['production', 'testing'],
            'is_active' => true,
        ];
    }

    public function windows11(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Windows 11 Enterprise',
            'os_type' => VMTemplateOSType::WINDOWS->value,
            'protocol' => VMTemplateProtocol::RDP->value,
            'template_vmid' => 110,
            'cpu_cores' => 4,
            'ram_mb' => 4096,
            'disk_gb' => 80,
            'tags' => ['windows', 'production'],
        ]);
    }

    public function ubuntu2204(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Ubuntu 22.04 LTS',
            'os_type' => VMTemplateOSType::LINUX->value,
            'protocol' => VMTemplateProtocol::SSH->value,
            'template_vmid' => 120,
            'cpu_cores' => 2,
            'ram_mb' => 2048,
            'disk_gb' => 40,
            'tags' => ['linux', 'ubuntu', 'production'],
        ]);
    }

    public function kaliLinux(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Kali Linux Rolling',
            'os_type' => VMTemplateOSType::KALI->value,
            'protocol' => VMTemplateProtocol::VNC->value,
            'template_vmid' => 130,
            'cpu_cores' => 4,
            'ram_mb' => 4096,
            'disk_gb' => 80,
            'tags' => ['linux', 'kali', 'security-testing'],
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }
}