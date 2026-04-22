<?php

namespace Tests\Feature;

use App\Enums\PaymentStatus;
use App\Enums\RefundStatus;
use App\Models\Payment;
use App\Models\RefundRequest;
use App\Models\TrainingPath;
use App\Models\User;
use App\Services\CheckoutService;
use App\Services\RefundService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private TrainingPath $paidTrainingPath;

    private TrainingPath $freeTrainingPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->paidTrainingPath = TrainingPath::factory()->approved()->create([
            'price_cents' => 9999, // $99.99
            'title' => 'Advanced IoT Programming',
        ]);

        $this->freeTrainingPath = TrainingPath::factory()->approved()->create([
            'price_cents' => 0,
            'title' => 'Free IoT Basics',
        ]);

        // Mock RefundService to avoid Stripe dependency
        $mockRefundService = \Mockery::mock(RefundService::class);
        $mockRefundService->shouldIgnoreMissing();
        $this->app->instance(RefundService::class, $mockRefundService);

        // Mock CheckoutService (will be overridden in individual tests)
        $mockCheckoutService = \Mockery::mock(CheckoutService::class);
        $mockCheckoutService->shouldIgnoreMissing();
        $this->app->instance(CheckoutService::class, $mockCheckoutService);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Authentication Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_initiate_checkout(): void
    {
        $response = $this->postJson('/checkout/initiate', [
            'training_path_id' => $this->paidTrainingPath->id,
        ]);

        $response->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_request_refund(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'training_path_id' => $this->paidTrainingPath->id,
        ]);

        $response = $this->postJson('/checkout/refund', [
            'payment_id' => $payment->id,
            'reason' => 'TrainingPath not as expected',
        ]);

        $response->assertUnauthorized();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Checkout Initiation Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_initiate_checkout_for_paid_training_path(): void
    {
        $mockCheckoutService = \Mockery::mock(CheckoutService::class);
        $mockCheckoutService->shouldReceive('createCheckoutSession')
            ->once()
            ->andReturn([
                'session_id' => 'cs_test_123',
                'checkout_url' => 'https://checkout.stripe.com/pay/cs_test_123',
            ]);

        $this->app->instance(CheckoutService::class, $mockCheckoutService);

        $response = $this->actingAs($this->user)
            ->postJson('/checkout/initiate', [
                'training_path_id' => $this->paidTrainingPath->id,
            ]);

        $response->assertOk()
            ->assertJson([
                'session_id' => 'cs_test_123',
                'checkout_url' => 'https://checkout.stripe.com/pay/cs_test_123',
            ]);
    }

    public function test_user_can_enroll_in_free_training_path_directly(): void
    {
        $mockCheckoutService = \Mockery::mock(CheckoutService::class);
        $mockCheckoutService->shouldReceive('createCheckoutSession')
            ->once()
            ->andReturn([
                'enrolled' => true,
                'training_path_url' => "/trainingPaths/{$this->freeTrainingPath->id}",
            ]);

        $this->app->instance(CheckoutService::class, $mockCheckoutService);

        $response = $this->actingAs($this->user)
            ->postJson('/checkout/initiate', [
                'training_path_id' => $this->freeTrainingPath->id,
            ]);

        $response->assertOk()
            ->assertJson([
                'enrolled' => true,
                'redirect_url' => "/trainingPaths/{$this->freeTrainingPath->id}",
            ]);
    }

    public function test_checkout_validates_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/checkout/initiate', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['training_path_id']);
    }

    public function test_checkout_validates_training_path_exists(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/checkout/initiate', [
                'training_path_id' => 999999,
            ]);

        $response->assertUnprocessable();
    }

    public function test_checkout_handles_domain_exceptions(): void
    {
        $mockCheckoutService = \Mockery::mock(CheckoutService::class);
        $mockCheckoutService->shouldReceive('createCheckoutSession')
            ->once()
            ->andThrow(new \DomainException('User already enrolled in trainingPath'));

        $this->app->instance(CheckoutService::class, $mockCheckoutService);

        $response = $this->actingAs($this->user)
            ->postJson('/checkout/initiate', [
                'training_path_id' => $this->paidTrainingPath->id,
            ]);

        $response->assertUnprocessable()
            ->assertJson(['error' => 'User already enrolled in trainingPath']);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Refund Request Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_request_refund_for_their_payment(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'training_path_id' => $this->paidTrainingPath->id,
            'status' => PaymentStatus::COMPLETED,
        ]);

        $refundRequest = RefundRequest::factory()->create([
            'payment_id' => $payment->id,
            'user_id' => $this->user->id,
            'status' => RefundStatus::PENDING,
            'reason' => 'TrainingPath not as expected',
        ]);

        // Create a fresh mock for this specific test
        $this->app->bind(RefundService::class, function () use ($refundRequest) {
            $mock = \Mockery::mock(RefundService::class);
            $mock->shouldReceive('requestRefund')
                ->andReturn($refundRequest);

            return $mock;
        });

        $response = $this->actingAs($this->user)
            ->postJson('/checkout/refund', [
                'payment_id' => $payment->id,
                'reason' => 'TrainingPath not as expected',
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'refund_request' => ['id', 'status', 'reason'],
                'message',
            ])
            ->assertJson(['message' => 'Your refund request has been submitted.']);
    }

    public function test_user_cannot_request_refund_for_others_payment(): void
    {
        $otherUser = User::factory()->create();
        $payment = Payment::factory()->create([
            'user_id' => $otherUser->id,
            'training_path_id' => $this->paidTrainingPath->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/checkout/refund', [
                'payment_id' => $payment->id,
                'reason' => 'TrainingPath not as expected',
            ]);

        $response->assertNotFound();
    }

    public function test_refund_request_validates_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/checkout/refund', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['payment_id', 'reason']);
    }

    public function test_refund_request_validates_payment_exists(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/checkout/refund', [
                'payment_id' => 999999,
                'reason' => 'This is a valid refund reason that is longer',
            ]);

        $response->assertNotFound();
    }

    public function test_refund_request_handles_domain_exceptions(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'training_path_id' => $this->paidTrainingPath->id,
        ]);

        $mockRefundService = \Mockery::mock(RefundService::class);
        $mockRefundService->shouldReceive('requestRefund')
            ->once()
            ->andThrow(new \DomainException('Refund period has expired'));

        $this->app->instance(RefundService::class, $mockRefundService);

        $response = $this->actingAs($this->user)
            ->postJson('/checkout/refund', [
                'payment_id' => $payment->id,
                'reason' => 'TrainingPath not as expected',
            ]);

        $response->assertUnprocessable()
            ->assertJson(['error' => 'Refund period has expired']);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Success Page Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_checkout_success_page_renders_with_session_id(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
            'stripe_session_id' => 'cs_test_123',
        ]);

        $mockCheckoutService = \Mockery::mock(CheckoutService::class);
        $mockCheckoutService->shouldReceive('getPaymentBySessionId')
            ->once()
            ->with('cs_test_123')
            ->andReturn($payment);

        $this->app->instance(CheckoutService::class, $mockCheckoutService);

        $response = $this->get('/checkout/success?session_id=cs_test_123');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('checkout/success')
                ->has('payment')
                ->where('payment.id', $payment->id)
            );
    }

    public function test_checkout_success_page_renders_without_session_id(): void
    {
        $mockCheckoutService = \Mockery::mock(CheckoutService::class);
        $mockCheckoutService->shouldReceive('getPaymentBySessionId')
            ->never();

        $this->app->instance(CheckoutService::class, $mockCheckoutService);

        $response = $this->get('/checkout/success');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('checkout/success')
                ->where('payment', null)
            );
    }

    // ────────────────────────────────────────────────────────────────────────
    // Cancelled Page Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_checkout_cancelled_page_renders_with_training_path(): void
    {
        $response = $this->get("/checkout/cancelled?trainingPath={$this->paidTrainingPath->id}");

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('checkout/cancelled')
                ->has('trainingPath')
                ->where('trainingPath.id', $this->paidTrainingPath->id)
                ->where('trainingPath.title', $this->paidTrainingPath->title)
            );
    }

    public function test_checkout_cancelled_page_renders_without_training_path(): void
    {
        $response = $this->get('/checkout/cancelled');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('checkout/cancelled')
                ->where('trainingPath', null)
            );
    }

    // ────────────────────────────────────────────────────────────────────────
    // Payment History Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_view_payment_history(): void
    {
        $payments = Payment::factory()->count(3)->create([
            'user_id' => $this->user->id,
        ]);

        // Create payments for another user (should not be returned)
        Payment::factory()->count(2)->create([
            'user_id' => User::factory()->create()->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/checkout/payments');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('checkout/payments')
                ->has('payments', 3)
                ->has('payments.0', fn ($payment) => $payment
                    ->has('id')
                    ->has('amount')
                    ->has('status')
                    ->has('created_at')
                    ->has('trainingPath')
                    ->has('status_label')
                    ->has('formatted_amount')
                    ->has('currency')
                    ->has('paid_at')
                    ->has('is_refundable')
                )
            );
    }

    public function test_payment_history_requires_authentication(): void
    {
        $response = $this->get('/checkout/payments');

        $response->assertRedirect('/login');
    }

    // ────────────────────────────────────────────────────────────────────────
    // Refund History Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_view_refund_requests(): void
    {
        $refunds = RefundRequest::factory()->count(2)->create([
            'user_id' => $this->user->id,
        ]);

        // Create refunds for another user (should not be returned)
        RefundRequest::factory()->create([
            'user_id' => User::factory()->create()->id,
        ]);

        $mockRefundService = \Mockery::mock(RefundService::class);
        $mockRefundService->shouldReceive('getUserRefundRequests')
            ->once()
            ->with($this->user)
            ->andReturn($refunds);

        $this->app->instance(RefundService::class, $mockRefundService);

        $response = $this->actingAs($this->user)
            ->get('/checkout/refunds');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('checkout/refunds')
                ->has('refunds', 2)
            );
    }

    public function test_refund_history_requires_authentication(): void
    {
        $response = $this->get('/checkout/refunds');

        $response->assertRedirect('/login');
    }

    // ────────────────────────────────────────────────────────────────────────
    // Security Tests (IDOR Prevention)
    // ────────────────────────────────────────────────────────────────────────

    public function test_refund_request_prevents_idor_attacks(): void
    {
        $otherUser = User::factory()->create();
        $payment = Payment::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/checkout/refund', [
                'payment_id' => $payment->id,
                'reason' => 'Trying to access other user payment',
            ]);

        $response->assertNotFound();

        // Ensure no refund request was created
        $this->assertDatabaseMissing('refund_requests', [
            'payment_id' => $payment->id,
            'user_id' => $this->user->id,
        ]);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Service Integration Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_checkout_service_is_called_with_correct_parameters(): void
    {
        $mockCheckoutService = \Mockery::mock(CheckoutService::class);
        $mockCheckoutService->shouldReceive('createCheckoutSession')
            ->once()
            ->with(
                \Mockery::on(fn ($user) => $user->id === $this->user->id),
                \Mockery::on(fn ($trainingPath) => $trainingPath->id === $this->paidTrainingPath->id)
            )
            ->andReturn([
                'session_id' => 'cs_test_123',
                'checkout_url' => 'https://checkout.stripe.com/test',
            ]);

        $this->app->instance(CheckoutService::class, $mockCheckoutService);

        $response = $this->actingAs($this->user)
            ->postJson('/checkout/initiate', [
                'training_path_id' => $this->paidTrainingPath->id,
            ]);

        $response->assertOk();
    }

    public function test_refund_service_is_called_with_correct_parameters(): void
    {
        $payment = Payment::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $mockRefundService = \Mockery::mock(RefundService::class);
        $mockRefundService->shouldReceive('requestRefund')
            ->once()
            ->andReturn(RefundRequest::factory()->make());

        $this->app->instance(RefundService::class, $mockRefundService);

        $this->actingAs($this->user)
            ->postJson('/checkout/refund', [
                'payment_id' => $payment->id,
                'reason' => 'TrainingPath quality issue',
            ]);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Error Handling Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_checkout_handles_stripe_failures_gracefully(): void
    {
        $mockCheckoutService = \Mockery::mock(CheckoutService::class);
        $mockCheckoutService->shouldReceive('createCheckoutSession')
            ->once()
            ->andThrow(new \Exception('Stripe API error'));

        $this->app->instance(CheckoutService::class, $mockCheckoutService);

        $response = $this->actingAs($this->user)
            ->postJson('/checkout/initiate', [
                'training_path_id' => $this->paidTrainingPath->id,
            ]);

        $response->assertServerError();
    }

    public function test_success_page_handles_invalid_session_id(): void
    {
        $mockCheckoutService = \Mockery::mock(CheckoutService::class);
        $mockCheckoutService->shouldReceive('getPaymentBySessionId')
            ->once()
            ->with('invalid_session_id')
            ->andReturn(null);

        $this->app->instance(CheckoutService::class, $mockCheckoutService);

        $response = $this->get('/checkout/success?session_id=invalid_session_id');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('checkout/success')
                ->where('payment', null)
            );
    }

    public function test_cancelled_page_handles_invalid_training_path_id(): void
    {
        $response = $this->get('/checkout/cancelled?trainingPath=999999');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('checkout/cancelled')
                ->where('trainingPath', null)
            );
    }
}
