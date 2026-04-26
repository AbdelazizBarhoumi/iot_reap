<?php

namespace Tests\Unit\Services;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\TrainingPath;
use App\Models\User;
use App\Repositories\PaymentRepository;
use App\Services\CheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Mockery\MockInterface;
use Stripe\Checkout\Session as StripeSession;
use Tests\TestCase;

class CheckoutServiceTest extends TestCase
{
    use RefreshDatabase;

    private CheckoutService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(CheckoutService::class);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Stripe Checkout Session Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_creates_stripe_checkout_session_for_paid_training_path(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $trainingPath = TrainingPath::factory()->approved()->create([
            'title' => 'Laravel Mastery',
            'price_cents' => 9900,
            'currency' => 'USD',
            'is_free' => false,
        ]);

        $mockSessionId = 'cs_test_'.uniqid();
        $mockCheckoutUrl = 'https://checkout.stripe.com/pay/'.$mockSessionId;

        // Mock the static StripeSession::create method
        $this->mockStripeSession($mockSessionId, $mockCheckoutUrl);

        $result = $this->service->createCheckoutSession($user, $trainingPath);

        $this->assertArrayHasKey('session_id', $result);
        $this->assertArrayHasKey('checkout_url', $result);
        $this->assertEquals($mockSessionId, $result['session_id']);
        $this->assertStringContainsString('stripe.com', $result['checkout_url']);
    }

    public function test_creates_pending_payment_record_for_checkout(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'title' => 'Testing TrainingPath',
            'price_cents' => 4990,
            'currency' => 'USD',
            'is_free' => false,
        ]);

        $mockSessionId = 'cs_test_'.uniqid();
        $this->mockStripeSession($mockSessionId, 'https://checkout.stripe.com/pay/test');

        $this->service->createCheckoutSession($user, $trainingPath);

        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'stripe_session_id' => $mockSessionId,
            'status' => PaymentStatus::PENDING->value,
            'amount_cents' => 4990,
            'currency' => 'USD',
        ]);
    }

    public function test_payment_metadata_includes_training_path_info(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'title' => 'Advanced Laravel',
            'price_cents' => 9900,
            'currency' => 'USD',
            'is_free' => false,
        ]);

        $this->mockStripeSession('cs_test_123', 'https://checkout.stripe.com/test');

        $this->service->createCheckoutSession($user, $trainingPath);

        $payment = Payment::where('user_id', $user->id)->first();
        $this->assertNotNull($payment->metadata);
        $this->assertEquals('Advanced Laravel', $payment->metadata['training_path_title']);
        $this->assertArrayHasKey('checkout_created_at', $payment->metadata);
    }

    public function test_converts_relative_thumbnail_to_absolute_url_for_stripe(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $trainingPath = TrainingPath::factory()->approved()->create([
            'title' => 'Thumbnail TrainingPath',
            'price_cents' => 9900,
            'currency' => 'USD',
            'is_free' => false,
            'thumbnail' => '/storage/training_path_thumbnails/test.png',
        ]);

        $mockSession = Mockery::mock('alias:'.StripeSession::class);
        $mockSession->shouldReceive('create')
            ->once()
            ->with(Mockery::on(function (array $payload): bool {
                $image = $payload['line_items'][0]['price_data']['product_data']['images'][0] ?? null;

                return is_string($image)
                    && str_starts_with($image, 'http')
                    && str_ends_with($image, '/storage/training_path_thumbnails/test.png');
            }))
            ->andReturn((object) [
                'id' => 'cs_test_thumbnail',
                'url' => 'https://checkout.stripe.com/pay/cs_test_thumbnail',
            ]);

        $this->service->createCheckoutSession($user, $trainingPath);
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'stripe_session_id' => 'cs_test_thumbnail',
        ]);
    }

    public function test_omits_invalid_thumbnail_url_from_stripe_payload(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);
        $trainingPath = TrainingPath::factory()->approved()->create([
            'title' => 'Invalid Thumbnail TrainingPath',
            'price_cents' => 9900,
            'currency' => 'USD',
            'is_free' => false,
            'thumbnail' => 'not-a-valid-url',
        ]);

        $mockSession = Mockery::mock('alias:'.StripeSession::class);
        $mockSession->shouldReceive('create')
            ->once()
            ->with(Mockery::on(function (array $payload): bool {
                return ! array_key_exists(
                    'images',
                    $payload['line_items'][0]['price_data']['product_data']
                );
            }))
            ->andReturn((object) [
                'id' => 'cs_test_no_image',
                'url' => 'https://checkout.stripe.com/pay/cs_test_no_image',
            ]);

        $this->service->createCheckoutSession($user, $trainingPath);
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'stripe_session_id' => 'cs_test_no_image',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Free TrainingPath Enrollment Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_enrolls_user_in_free_training_path(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'title' => 'Free Intro TrainingPath',
            'price_cents' => 0,
            'is_free' => true,
            'currency' => 'USD',
        ]);

        $result = $this->service->createCheckoutSession($user, $trainingPath);

        $this->assertArrayHasKey('enrolled', $result);
        $this->assertTrue($result['enrolled']);
        $this->assertArrayHasKey('training_path_url', $result);

        // Verify enrollment was created
        $this->assertTrue($user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->exists());
    }

    public function test_creates_zero_amount_payment_for_free_training_path(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'title' => 'Free TrainingPath',
            'price_cents' => 0,
            'is_free' => true,
            'currency' => 'USD',
        ]);

        $this->service->createCheckoutSession($user, $trainingPath);

        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'status' => PaymentStatus::COMPLETED->value,
            'amount_cents' => 0,
        ]);

        $payment = Payment::where('user_id', $user->id)->first();
        $this->assertStringStartsWith('free_', $payment->stripe_session_id);
        $this->assertNotNull($payment->paid_at);
        $this->assertEquals('free', $payment->metadata['enrollment_type']);
    }

    public function test_free_enrollment_with_zero_price_cents(): void
    {
        $user = User::factory()->create();
        // TrainingPath with is_free = false but price_cents = 0 should still be free
        $trainingPath = TrainingPath::factory()->approved()->create([
            'price_cents' => 0,
            'is_free' => false,
            'currency' => 'USD',
        ]);

        $result = $this->service->createCheckoutSession($user, $trainingPath);

        $this->assertTrue($result['enrolled']);
        $this->assertTrue($user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->exists());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Duplicate Enrollment Prevention Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_prevents_duplicate_enrollment_for_paid_training_path(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'price_cents' => 9900,
            'is_free' => false,
            'currency' => 'USD',
        ]);

        // Pre-enroll the user
        $user->enrolledTrainingPaths()->attach($trainingPath->id, ['enrolled_at' => now()]);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('You are already enrolled in this trainingPath.');

        $this->service->createCheckoutSession($user, $trainingPath);
    }

    public function test_prevents_duplicate_enrollment_for_free_training_path(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'price_cents' => 0,
            'is_free' => true,
            'currency' => 'USD',
        ]);

        // Pre-enroll the user
        $user->enrolledTrainingPaths()->attach($trainingPath->id, ['enrolled_at' => now()]);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('You are already enrolled in this trainingPath.');

        $this->service->createCheckoutSession($user, $trainingPath);
    }

    public function test_rejects_checkout_for_unpublished_training_path(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create([
            'is_free' => false,
            'price_cents' => 9900,
            'currency' => 'EUR',
        ]);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('This training path is not available for enrollment.');

        $this->service->createCheckoutSession($user, $trainingPath);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Payment Retrieval Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_payment_by_stripe_session_id(): void
    {
        $payment = Payment::factory()->create([
            'stripe_session_id' => 'cs_test_unique_session_id',
        ]);

        $found = $this->service->getPaymentBySessionId('cs_test_unique_session_id');

        $this->assertNotNull($found);
        $this->assertEquals($payment->id, $found->id);
    }

    public function test_returns_null_for_nonexistent_session_id(): void
    {
        $found = $this->service->getPaymentBySessionId('cs_nonexistent_session');

        $this->assertNull($found);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Purchase Verification Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_has_purchased_returns_true_for_completed_payment(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        Payment::factory()->completed()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $this->assertTrue($this->service->hasPurchased($user, $trainingPath));
    }

    public function test_has_purchased_returns_false_for_pending_payment(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        Payment::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'status' => PaymentStatus::PENDING,
        ]);

        $this->assertFalse($this->service->hasPurchased($user, $trainingPath));
    }

    public function test_has_purchased_returns_false_for_failed_payment(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        Payment::factory()->failed()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $this->assertFalse($this->service->hasPurchased($user, $trainingPath));
    }

    public function test_has_purchased_returns_false_when_no_payment_exists(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        $this->assertFalse($this->service->hasPurchased($user, $trainingPath));
    }

    public function test_has_purchased_is_user_specific(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        Payment::factory()->completed()->create([
            'user_id' => $user1->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $this->assertTrue($this->service->hasPurchased($user1, $trainingPath));
        $this->assertFalse($this->service->hasPurchased($user2, $trainingPath));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Transaction Integrity Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_free_enrollment_uses_database_transaction(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'title' => 'Transaction Test TrainingPath',
            'price_cents' => 0,
            'is_free' => true,
            'currency' => 'USD',
        ]);

        // Mock repository to throw after payment creation to test rollback
        $this->mock(PaymentRepository::class, function (MockInterface $mock) {
            $mock->shouldReceive('create')
                ->once()
                ->andThrow(new \Exception('Simulated failure'));
        });

        $service = app(CheckoutService::class);

        try {
            $service->createCheckoutSession($user, $trainingPath);
            $this->fail('Expected exception was not thrown');
        } catch (\Exception $e) {
            $this->assertEquals('Simulated failure', $e->getMessage());
        }

        // Verify no enrollment was created due to transaction rollback
        $this->assertFalse($user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->exists());
        $this->assertDatabaseMissing('payments', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Mock the Stripe Session::create static method.
     */
    private function mockStripeSession(string $sessionId, string $checkoutUrl): void
    {
        $mockSession = Mockery::mock('alias:'.StripeSession::class);
        $mockSession->shouldReceive('create')
            ->once()
            ->andReturn((object) [
                'id' => $sessionId,
                'url' => $checkoutUrl,
            ]);
    }
}
