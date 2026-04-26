<?php

namespace Tests\Unit\Services;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\TrainingPath;
use App\Models\User;
use App\Repositories\PaymentRepository;
use App\Services\EnrollmentService;
use App\Services\StripeWebhookService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Mockery;
use Stripe\Checkout\Session;
use Stripe\Event;
use Stripe\Stripe;
use Stripe\StripeObject;
use Tests\TestCase;

class StripeWebhookServiceTest extends TestCase
{
    use RefreshDatabase;

    private StripeWebhookService $service;

    private PaymentRepository $paymentRepository;

    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();

        // Force load Stripe library components before any tests run
        // This prevents "Undefined constant" errors in full test suite
        Stripe::setApiKey('sk_test_dummy_key');

        // Explicitly trigger the ObjectTypes registry initialization
        $reflectionClass = new \ReflectionClass(Session::class);
        $reflectionClass->getName(); // Just accessing it should force autoload
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->paymentRepository = app(PaymentRepository::class);
        $this->service = app(StripeWebhookService::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // checkout.session.completed Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_handles_checkout_session_completed(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->forTrainingPath($trainingPath)
            ->create([
                'stripe_session_id' => 'cs_test_checkout_123',
                'status' => PaymentStatus::PENDING,
            ]);

        $event = $this->createStripeEvent('checkout.session.completed', [
            'id' => 'cs_test_checkout_123',
            'payment_intent' => 'pi_test_intent_456',
        ]);

        $this->service->handleEvent($event);

        $payment->refresh();
        $this->assertEquals(PaymentStatus::COMPLETED, $payment->status);
        $this->assertEquals('pi_test_intent_456', $payment->stripe_payment_intent_id);
        $this->assertNotNull($payment->paid_at);
    }

    public function test_enrolls_user_after_successful_payment(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->forTrainingPath($trainingPath)
            ->create([
                'stripe_session_id' => 'cs_test_enroll_123',
                'status' => PaymentStatus::PENDING,
            ]);

        $event = $this->createStripeEvent('checkout.session.completed', [
            'id' => 'cs_test_enroll_123',
            'payment_intent' => 'pi_test_enroll_456',
        ]);

        $this->service->handleEvent($event);

        $this->assertTrue(
            $user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->exists()
        );
        $this->assertDatabaseHas('training_path_enrollments', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);
    }

    public function test_does_not_duplicate_enrollment_on_repeated_webhook(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->forTrainingPath($trainingPath)
            ->create([
                'stripe_session_id' => 'cs_test_duplicate_123',
                'status' => PaymentStatus::PENDING,
            ]);

        $event = $this->createStripeEvent('checkout.session.completed', [
            'id' => 'cs_test_duplicate_123',
            'payment_intent' => 'pi_test_duplicate_456',
        ]);

        // First webhook call
        $this->service->handleEvent($event);

        // Second webhook call (duplicate)
        $this->service->handleEvent($event);

        $enrollmentCount = $user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->count();
        $this->assertEquals(1, $enrollmentCount);
    }

    public function test_skips_already_completed_payment(): void
    {
        Log::shouldReceive('info')
            ->once()
            ->withArgs(fn ($message) => str_contains($message, 'already completed'));

        $payment = Payment::factory()
            ->completed()
            ->create([
                'stripe_session_id' => 'cs_test_already_completed',
                'stripe_payment_intent_id' => 'pi_original_intent',
            ]);

        $event = $this->createStripeEvent('checkout.session.completed', [
            'id' => 'cs_test_already_completed',
            'payment_intent' => 'pi_new_intent_should_be_ignored',
        ]);

        $this->service->handleEvent($event);

        $payment->refresh();
        $this->assertEquals('pi_original_intent', $payment->stripe_payment_intent_id);
    }

    public function test_logs_warning_when_payment_not_found_for_checkout(): void
    {
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(fn ($message) => str_contains($message, 'Payment not found'));

        $event = $this->createStripeEvent('checkout.session.completed', [
            'id' => 'cs_nonexistent_session',
            'payment_intent' => 'pi_test_nonexistent',
        ]);

        $this->service->handleEvent($event);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // checkout.session.expired Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_handles_checkout_session_expired(): void
    {
        $payment = Payment::factory()->create([
            'stripe_session_id' => 'cs_test_expired_123',
            'status' => PaymentStatus::PENDING,
        ]);

        $event = $this->createStripeEvent('checkout.session.expired', [
            'id' => 'cs_test_expired_123',
        ]);

        $this->service->handleEvent($event);

        $payment->refresh();
        $this->assertEquals(PaymentStatus::FAILED, $payment->status);
    }

    public function test_does_not_mark_completed_payment_as_failed_on_expire(): void
    {
        $payment = Payment::factory()
            ->completed()
            ->create([
                'stripe_session_id' => 'cs_test_completed_expire',
            ]);

        $event = $this->createStripeEvent('checkout.session.expired', [
            'id' => 'cs_test_completed_expire',
        ]);

        $this->service->handleEvent($event);

        $payment->refresh();
        $this->assertEquals(PaymentStatus::COMPLETED, $payment->status);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // payment_intent.payment_failed Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_handles_payment_failed_event(): void
    {
        $payment = Payment::factory()->create([
            'stripe_payment_intent_id' => 'pi_test_failed_123',
            'status' => PaymentStatus::PENDING,
        ]);

        $event = $this->createStripeEvent('payment_intent.payment_failed', [
            'id' => 'pi_test_failed_123',
            'last_payment_error' => (object) ['message' => 'Card declined'],
        ]);

        $this->service->handleEvent($event);

        $payment->refresh();
        $this->assertEquals(PaymentStatus::FAILED, $payment->status);
    }

    public function test_logs_payment_failure_reason(): void
    {
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(function ($message, $context) {
                return str_contains($message, 'Payment failed')
                    && ($context['error'] ?? '') === 'Card declined';
            });

        $payment = Payment::factory()->create([
            'stripe_payment_intent_id' => 'pi_test_log_failure',
            'status' => PaymentStatus::PENDING,
        ]);

        $event = $this->createStripeEvent('payment_intent.payment_failed', [
            'id' => 'pi_test_log_failure',
            'last_payment_error' => (object) ['message' => 'Card declined'],
        ]);

        $this->service->handleEvent($event);
    }

    public function test_handles_payment_failed_without_error_message(): void
    {
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(function ($message, $context) {
                return str_contains($message, 'Payment failed')
                    && ($context['error'] ?? '') === 'Unknown error';
            });

        $payment = Payment::factory()->create([
            'stripe_payment_intent_id' => 'pi_test_no_error_msg',
            'status' => PaymentStatus::PENDING,
        ]);

        $event = $this->createStripeEvent('payment_intent.payment_failed', [
            'id' => 'pi_test_no_error_msg',
            'last_payment_error' => null,
        ]);

        $this->service->handleEvent($event);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // charge.refunded Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_handles_full_refund(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->forTrainingPath($trainingPath)
            ->completed()
            ->create([
                'stripe_payment_intent_id' => 'pi_test_refund_full',
                'amount_cents' => 5000,
            ]);

        // Enroll user first
        $user->enrolledTrainingPaths()->attach($trainingPath->id, ['enrolled_at' => now()]);

        $event = $this->createStripeEvent('charge.refunded', [
            'payment_intent' => 'pi_test_refund_full',
            'amount_refunded' => 5000,
            'amount' => 5000,
        ]);

        $this->service->handleEvent($event);

        $payment->refresh();
        $this->assertEquals(PaymentStatus::REFUNDED, $payment->status);
        $this->assertFalse($user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->exists());
    }

    public function test_handles_partial_refund(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->forTrainingPath($trainingPath)
            ->completed()
            ->create([
                'stripe_payment_intent_id' => 'pi_test_refund_partial',
                'amount_cents' => 5000,
            ]);

        // Enroll user first
        $user->enrolledTrainingPaths()->attach($trainingPath->id, ['enrolled_at' => now()]);

        $event = $this->createStripeEvent('charge.refunded', [
            'payment_intent' => 'pi_test_refund_partial',
            'amount_refunded' => 2500, // 50% refund
            'amount' => 5000,
        ]);

        $this->service->handleEvent($event);

        $payment->refresh();
        $this->assertEquals(PaymentStatus::PARTIALLY_REFUNDED, $payment->status);
        // User should remain enrolled for partial refund
        $this->assertTrue($user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->exists());
    }

    public function test_logs_warning_when_payment_not_found_for_refund(): void
    {
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(fn ($message) => str_contains($message, 'Payment not found for refund'));

        Log::shouldReceive('info')->andReturnNull();

        $event = $this->createStripeEvent('charge.refunded', [
            'payment_intent' => 'pi_nonexistent_refund',
            'amount_refunded' => 5000,
            'amount' => 5000,
        ]);

        $this->service->handleEvent($event);
    }

    public function test_logs_refund_details(): void
    {
        Log::shouldReceive('info')
            ->withArgs(fn ($message) => str_contains($message, 'User unenrolled'))
            ->zeroOrMoreTimes();

        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return str_contains($message, 'Payment refunded')
                    && ($context['refunded_amount'] ?? 0) === 5000
                    && ($context['original_amount'] ?? 0) === 5000;
            });

        $payment = Payment::factory()
            ->completed()
            ->create([
                'stripe_payment_intent_id' => 'pi_test_refund_log',
                'amount_cents' => 5000,
            ]);

        $event = $this->createStripeEvent('charge.refunded', [
            'payment_intent' => 'pi_test_refund_log',
            'amount_refunded' => 5000,
            'amount' => 5000,
        ]);

        $this->service->handleEvent($event);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Unknown Event Type Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_ignores_unknown_event_types(): void
    {
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return str_contains($message, 'Unhandled Stripe event')
                    && ($context['type'] ?? '') === 'customer.created';
            });

        $event = $this->createStripeEvent('customer.created', [
            'id' => 'cus_test_123',
        ]);

        $this->service->handleEvent($event);
    }

    public function test_ignores_invoice_events(): void
    {
        Log::shouldReceive('info')
            ->once()
            ->withArgs(fn ($message, $context) => ($context['type'] ?? '') === 'invoice.paid');

        $event = $this->createStripeEvent('invoice.paid', [
            'id' => 'in_test_123',
        ]);

        $this->service->handleEvent($event);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Edge Case Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_handles_multiple_events_for_same_payment(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->forTrainingPath($trainingPath)
            ->create([
                'stripe_session_id' => 'cs_test_multi_event',
                'stripe_payment_intent_id' => 'pi_test_multi_event',
                'status' => PaymentStatus::PENDING,
                'amount_cents' => 5000,
            ]);

        // First: checkout completed
        $checkoutEvent = $this->createStripeEvent('checkout.session.completed', [
            'id' => 'cs_test_multi_event',
            'payment_intent' => 'pi_test_multi_event',
        ]);
        $this->service->handleEvent($checkoutEvent);

        $payment->refresh();
        $this->assertEquals(PaymentStatus::COMPLETED, $payment->status);
        $this->assertTrue($user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->exists());

        // Then: refund
        $refundEvent = $this->createStripeEvent('charge.refunded', [
            'payment_intent' => 'pi_test_multi_event',
            'amount_refunded' => 5000,
            'amount' => 5000,
        ]);
        $this->service->handleEvent($refundEvent);

        $payment->refresh();
        $this->assertEquals(PaymentStatus::REFUNDED, $payment->status);
        $this->assertFalse($user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->exists());
    }

    public function test_handles_concurrent_user_enrollment_in_multiple_training_paths(): void
    {
        $user = User::factory()->create();
        $trainingPath1 = TrainingPath::factory()->approved()->create();
        $trainingPath2 = TrainingPath::factory()->approved()->create();

        $payment1 = Payment::factory()
            ->forUser($user)
            ->forTrainingPath($trainingPath1)
            ->create([
                'stripe_session_id' => 'cs_test_trainingPath1',
                'status' => PaymentStatus::PENDING,
            ]);

        $payment2 = Payment::factory()
            ->forUser($user)
            ->forTrainingPath($trainingPath2)
            ->create([
                'stripe_session_id' => 'cs_test_trainingPath2',
                'status' => PaymentStatus::PENDING,
            ]);

        $event1 = $this->createStripeEvent('checkout.session.completed', [
            'id' => 'cs_test_trainingPath1',
            'payment_intent' => 'pi_test_trainingPath1',
        ]);

        $event2 = $this->createStripeEvent('checkout.session.completed', [
            'id' => 'cs_test_trainingPath2',
            'payment_intent' => 'pi_test_trainingPath2',
        ]);

        $this->service->handleEvent($event1);
        $this->service->handleEvent($event2);

        $this->assertTrue($user->enrolledTrainingPaths()->where('training_path_id', $trainingPath1->id)->exists());
        $this->assertTrue($user->enrolledTrainingPaths()->where('training_path_id', $trainingPath2->id)->exists());
        $this->assertEquals(2, $user->enrolledTrainingPaths()->count());
    }

    public function test_does_not_mark_payment_completed_if_enrollment_fails(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        $payment = Payment::factory()
            ->forUser($user)
            ->forTrainingPath($trainingPath)
            ->create([
                'stripe_session_id' => 'cs_test_enrollment_failure',
                'status' => PaymentStatus::PENDING,
                'stripe_payment_intent_id' => null,
            ]);

        $event = $this->createStripeEvent('checkout.session.completed', [
            'id' => 'cs_test_enrollment_failure',
            'payment_intent' => 'pi_test_enrollment_failure',
        ]);

        $enrollmentService = Mockery::mock(EnrollmentService::class);
        $enrollmentService
            ->shouldReceive('enroll')
            ->once()
            ->andThrow(new \DomainException('Enrollment failed'));

        $this->app->instance(EnrollmentService::class, $enrollmentService);
        $service = app(StripeWebhookService::class);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Enrollment failed');

        try {
            $service->handleEvent($event);
        } finally {
            $payment->refresh();
            $this->assertEquals(PaymentStatus::PENDING, $payment->status);
            $this->assertNull($payment->paid_at);
            $this->assertNull($payment->stripe_payment_intent_id);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create a mock Stripe Event object for testing.
     */
    private function createStripeEvent(string $type, array $data): Event
    {
        return $this->makeEventTestDouble($type, $data);
    }

    private function makeEventTestDouble(string $type, array $data): Event
    {
        // Create a subclass of Stripe\Event that works around initialization issues
        $eventClass = new class extends Event
        {
            public $__type;

            public $__data;

            public function __construct($type = null, $data = null)
            {
                // Skip parent constructor to avoid initialization issues
                if ($type !== null) {
                    $this->__type = $type;
                }
                if ($data !== null) {
                    $this->__data = $data;
                }
            }

            public function &__get($name)
            {
                if ($name === 'type' && isset($this->__type)) {
                    return $this->__type;
                }
                if ($name === 'data' && isset($this->__data)) {
                    return $this->__data;
                }

                return parent::__get($name);
            }

            public function __set($name, $value)
            {
                if ($name === 'type') {
                    $this->__type = $value;

                    return;
                }
                if ($name === 'data') {
                    $this->__data = $value;

                    return;
                }
                parent::__set($name, $value);
            }
        };

        $event = new $eventClass;
        $event->type = $type;

        // Create a StripeObject subclass
        $dataClass = new class extends StripeObject
        {
            public $__object;

            public function __construct()
            {
                // Skip parent constructor to avoid initialization issues
            }

            public function &__get($name)
            {
                if ($name === 'object' && isset($this->__object)) {
                    return $this->__object;
                }

                return parent::__get($name);
            }

            public function __set($name, $value)
            {
                if ($name === 'object') {
                    $this->__object = $value;

                    return;
                }
                parent::__set($name, $value);
            }
        };

        $event->data = new $dataClass;

        // Create object as a simple stdClass that acts like a StripeObject
        $objectStdClass = new class($data)
        {
            private array $data;

            public function __construct(array $data)
            {
                $this->data = $data;
            }

            public function __get($name)
            {
                if (! isset($this->data[$name])) {
                    return null;
                }

                $value = $this->data[$name];
                if (is_array($value)) {
                    return new self($value);
                }

                return $value;
            }

            public function __isset($name)
            {
                return isset($this->data[$name]);
            }
        };

        $event->data->object = $objectStdClass;

        return $event;
    }
}
