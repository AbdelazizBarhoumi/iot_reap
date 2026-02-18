<?php

namespace Database\Factories;

use App\Enums\VMTemplateOSType;
use App\Enums\VMTemplateProtocol;
use App\Models\VMTemplate;
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
            'name' => $this->faker->word() . ' Template',
            'os_type' => VMTemplateOSType::LINUX->value,
            'protocol' => VMTemplateProtocol::SSH->value,
            'template_vmid' => $this->faker->unique()->numberBetween(100, 199),
            'cpu_cores' => $this->faker->randomElement([2, 4, 8]),
            'ram_mb' => $this->faker->randomElement([2048, 4096, 8192]),
            'disk_gb' => $this->faker->randomElement([50, 100, 200]),
            'tags' => ['demo', 'testing'],
            'is_active' => true,
        ];
    }

    /**
     * Create a Windows 11 template.
     */
    public function windows11(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Windows 11',
            'os_type' => VMTemplateOSType::WINDOWS->value,
            'protocol' => VMTemplateProtocol::RDP->value,
            'template_vmid' => 120,
            'cpu_cores' => 4,
            'ram_mb' => 4096,
            'disk_gb' => 100,
            'tags' => ['windows', 'enterprise'],
        ]);
    }

    /**
     * Create an Ubuntu 22.04 template.
     */
    public function ubuntu2204(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Ubuntu 22.04',
            'os_type' => VMTemplateOSType::LINUX->value,
            'protocol' => VMTemplateProtocol::SSH->value,
            'template_vmid' => 130,
            'cpu_cores' => 4,
            'ram_mb' => 4096,
            'disk_gb' => 50,
            'tags' => ['linux', 'ubuntu', 'lts'],
        ]);
    }

    /**
     * Create a Kali Linux template.
     */
    public function kaliLinux(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Kali Linux',
            'os_type' => VMTemplateOSType::KALI->value,
            'protocol' => VMTemplateProtocol::RDP->value,
            'template_vmid' => 140,
            'cpu_cores' => 4,
            'ram_mb' => 4096,
            'disk_gb' => 80,
            'tags' => ['kali', 'security', 'penetration-testing'],
        ]);
    }

    /**
     * Indicate the template is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
