<?php

namespace Database\Factories;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Certificate>
 */
class CertificateFactory extends Factory
{
    protected $model = Certificate::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course_id' => Course::factory(),
            'hash' => Str::random(64),
            'pdf_path' => null,
            'issued_at' => now(),
        ];
    }

    /**
     * Certificate with PDF generated.
     */
    public function withPdf(): static
    {
        return $this->state(fn (array $attributes) => [
            'pdf_path' => 'certificates/'.Str::random(64).'.pdf',
        ]);
    }
}
