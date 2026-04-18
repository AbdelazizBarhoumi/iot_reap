<?php

namespace Tests\Feature\Security;

use App\Enums\PaymentStatus;
use App\Models\TrainingPath;
use App\Models\Payment;
use App\Models\User;
use App\Services\CheckoutService;
use App\Services\RefundService;
use Tests\TestCase;

/**
 * IDOR security tests for CheckoutController.
 *
 * Verifies that users cannot request refunds for payments
 * belonging to other users.
 */
class CheckoutIdorTest extends TestCase
{
    private User $user;

    private User $otherUser;

    private TrainingPath $trainingPath;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->engineer()->create();
        $this->otherUser = User::factory()->engineer()->create();
        $this->trainingPath = TrainingPath::factory()->approved()->create();

        // Mock both services to avoid Stripe dependencies in constructor
        $this->mock(CheckoutService::class, function ($mock) {
            $mock->shouldReceive('createCheckoutSession')->andReturn(['session_id' => 'test']);
            $mock->shouldReceive('getPaymentBySessionId')->andReturn(null);
        });

        $this->mock(RefundService::class, function ($mock) {
            // Mock will be configured per-test as needed
        });
    }

    public function test_user_cannot_request_refund_for_another_users_payment(): void
    {
        // Create a payment belonging to another user
        $otherUsersPayment = Payment::create([
            'user_id' => $this->otherUser->id,
            'training_path_id' => $this->trainingPath->id,
            'stripe_session_id' => 'cs_test_'.uniqid(),
            'stripe_payment_intent_id' => 'pi_test_'.uniqid(),
            'status' => PaymentStatus::COMPLETED,
            'amount_cents' => 9900,
            'currency' => 'usd',
            'paid_at' => now(),
        ]);

        // Attempt to request refund for another user's payment
        $response = $this->actingAs($this->user)
            ->postJson('/checkout/refund', [
                'payment_id' => $otherUsersPayment->id,
                'reason' => 'I want a refund because the trainingPath was not what I expected',
            ]);

        // Should return 404 (not found) since the query is scoped to user
        $response->assertNotFound();
    }

    public function test_user_can_request_refund_for_own_payment(): void
    {
        // Create a RefundRequest model factory instead of using mock
        $refundRequestModel = \App\Models\RefundRequest::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        // Configure RefundService mock for this specific test to return the RefundRequest model
        $this->app->instance(RefundService::class,
            \Mockery::mock(RefundService::class, function ($mock) use ($refundRequestModel) {
                $mock->shouldReceive('requestRefund')->once()->andReturn($refundRequestModel);
            })
        );

        // Create a payment belonging to the authenticated user
        $ownPayment = Payment::create([
            'user_id' => $this->user->id,
            'training_path_id' => $this->trainingPath->id,
            'stripe_session_id' => 'cs_test_'.uniqid(),
            'stripe_payment_intent_id' => 'pi_test_'.uniqid(),
            'status' => PaymentStatus::COMPLETED,
            'amount_cents' => 9900,
            'currency' => 'usd',
            'paid_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/checkout/refund', [
                'payment_id' => $ownPayment->id,
                'reason' => 'TrainingPath did not meet expectations',
            ]);

        // Should succeed (201 Created for refund request)
        $response->assertCreated();
        $response->assertJsonStructure(['refund_request', 'message']);
    }

    public function test_user_cannot_access_nonexistent_payment_id(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/checkout/refund', [
                'payment_id' => 99999,
                'reason' => 'Trying to access a payment that does not exist in the system',
            ]);

        $response->assertNotFound();
    }

    public function test_unauthenticated_user_cannot_request_refund(): void
    {
        $response = $this->postJson('/checkout/refund', [
            'payment_id' => 1,
            'reason' => 'Anonymous refund attempt',
        ]);

        $response->assertUnauthorized();
    }
}
