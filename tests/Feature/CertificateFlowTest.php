<?php

namespace Tests\Feature;

use App\Models\Certificate;
use App\Models\TrainingPath;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CertificateFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_check_endpoint_regenerates_missing_certificate_pdf(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $trainingPath = TrainingPath::factory()->forInstructor($user)->create();

        $certificate = Certificate::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'pdf_path' => null,
        ]);

        $response = $this->actingAs($user)->getJson(
            "/certificates/trainingPaths/{$trainingPath->id}/check"
        );

        $response->assertOk();
        $response->assertJson([
            'has_certificate' => true,
            'data' => [
                'id' => $certificate->id,
                'hash' => $certificate->hash,
                'has_pdf' => true,
            ],
        ]);

        $certificate->refresh();

        $this->assertNotNull($certificate->pdf_path);
        $this->assertTrue(Storage::disk(config('filesystems.default'))->exists($certificate->pdf_path));
    }

    public function test_store_endpoint_returns_existing_certificate_and_repairs_pdf(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $trainingPath = TrainingPath::factory()->forInstructor($user)->create();

        $certificate = Certificate::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'pdf_path' => null,
        ]);

        $response = $this->actingAs($user)->postJson(
            "/certificates/trainingPaths/{$trainingPath->id}"
        );

        $response->assertOk();
        $response->assertJson([
            'data' => [
                'id' => $certificate->id,
                'hash' => $certificate->hash,
                'has_pdf' => true,
            ],
        ]);

        $certificate->refresh();

        $this->assertNotNull($certificate->pdf_path);
        $this->assertTrue(Storage::disk(config('filesystems.default'))->exists($certificate->pdf_path));
    }
}
