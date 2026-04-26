<?php

namespace Tests\Feature;

use App\Models\Certificate;
use App\Models\TrainingPath;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CertificateVerificationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a certificate can be verified using the public URL.
     */
    public function test_can_verify_certificate_with_public_url()
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $certificate = Certificate::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'hash' => 'test-hash-123',
        ]);

        $response = $this->get("/certificates/{$certificate->hash}/verify");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('certificates/verify')
            ->where('valid', true)
            ->has('certificate', fn (Assert $cert) => $cert
                ->where('hash', $certificate->hash)
                ->where('user.name', $user->name)
                ->where('trainingPath.title', $trainingPath->title)
                ->etc()
            )
        );
    }

    /**
     * Test that an invalid hash returns a 200 status with valid=false for HTML requests.
     */
    public function test_shows_error_for_invalid_certificate_hash()
    {
        $response = $this->get('/certificates/invalid-hash/verify');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('certificates/verify')
            ->where('valid', false)
            ->where('certificate', null)
        );
    }

    /**
     * Test that the verification endpoint returns JSON when requested.
     */
    public function test_returns_json_for_api_verification_request()
    {
        $certificate = Certificate::factory()->create([
            'hash' => 'api-hash-789',
        ]);

        $response = $this->getJson("/certificates/{$certificate->hash}/verify");

        $response->assertStatus(200);
        $response->assertJson([
            'valid' => true,
            'certificate' => [
                'hash' => 'api-hash-789',
            ],
        ]);
    }
}
