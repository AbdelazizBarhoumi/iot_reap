<?php

namespace Tests\Feature;

use App\Models\PayoutRequest;
use App\Models\User;
use App\Services\PayoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class TeacherPayoutControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;

    private User $engineer;

    private $payoutServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->teacher()->create();
        $this->engineer = User::factory()->engineer()->create();

        $this->payoutServiceMock = Mockery::mock(PayoutService::class);
        $this->app->instance(PayoutService::class, $this->payoutServiceMock);
    }

    public function test_teacher_can_view_payout_dashboard_payload(): void
    {
        $payouts = PayoutRequest::factory()->count(2)->forTeacher($this->teacher)->create();

        $this->payoutServiceMock
            ->shouldReceive('getTeacherPayouts')
            ->once()
            ->with($this->teacher)
            ->andReturn($payouts);

        $this->payoutServiceMock
            ->shouldReceive('getAvailableBalance')
            ->once()
            ->with($this->teacher)
            ->andReturn(12500);

        $response = $this->actingAs($this->teacher)
            ->getJson('/teaching/payouts');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'amount',
                        'amount_cents',
                        'currency',
                        'status',
                        'status_label',
                        'requestedAt',
                    ],
                ],
                'available_balance_cents',
                'available_balance',
            ])
            ->assertJsonPath('available_balance_cents', 12500)
            ->assertJsonPath('available_balance', 125);
    }

    public function test_teacher_can_request_payout(): void
    {
        $payout = PayoutRequest::factory()->forTeacher($this->teacher)->pending()->withAmount(10000)->create();

        $this->payoutServiceMock
            ->shouldReceive('requestPayout')
            ->once()
            ->with(
                $this->teacher,
                10000,
                'stripe',
                null,
            )
            ->andReturn($payout);

        $response = $this->actingAs($this->teacher)
            ->postJson('/teaching/payouts/request', [
                'amount' => 100,
                'payout_method' => 'stripe',
            ]);

        $response->assertCreated()
            ->assertJson([
                'message' => 'Payout request submitted successfully.',
            ])
            ->assertJsonPath('data.amount_cents', 10000)
            ->assertJsonPath('data.status', 'pending');
    }

    public function test_teacher_cannot_request_payout_below_minimum(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson('/teaching/payouts/request', [
                'amount' => 20,
                'payout_method' => 'stripe',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_non_teacher_cannot_access_teacher_payout_endpoints(): void
    {
        $response = $this->actingAs($this->engineer)
            ->getJson('/teaching/payouts');

        $response->assertForbidden();

        $this->actingAs($this->engineer)
            ->postJson('/teaching/payouts/request', [
                'amount' => 100,
            ])
            ->assertForbidden();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
