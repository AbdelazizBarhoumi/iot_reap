<?php

namespace Tests\Feature\Admin;

use App\Models\Payment;
use App\Models\PayoutRequest;
use App\Models\RefundRequest;
use App\Models\User;
use App\Services\PayoutService;
use App\Services\RefundService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Pagination\LengthAwarePaginator;
use Mockery;
use Tests\TestCase;

class AdminFinanceControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $teacher;

    private User $student;

    private PayoutRequest $payoutRequest;

    private RefundRequest $refundRequest;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->teacher = User::factory()->teacher()->create();
        $this->student = User::factory()->engineer()->create();

        $payment = Payment::factory()->completed()->create([
            'user_id' => $this->student->id,
        ]);

        $this->payoutRequest = PayoutRequest::factory()
            ->pending()
            ->forTeacher($this->teacher)
            ->create();

        $this->refundRequest = RefundRequest::factory()
            ->pending()
            ->forPayment($payment)
            ->create();
    }

    public function test_admin_can_view_unified_finance_workspace(): void
    {
        $payouts = new LengthAwarePaginator(
            [$this->payoutRequest],
            1,
            20,
            1,
            ['path' => request()->url()],
        );

        $refunds = new LengthAwarePaginator(
            [$this->refundRequest],
            1,
            20,
            1,
            ['path' => request()->url()],
        );

        $this->app->instance(
            PayoutService::class,
            Mockery::mock(PayoutService::class, function ($mock) use ($payouts) {
                $mock->shouldReceive('getPendingPayouts')->once()->andReturn($payouts);
                $mock->shouldReceive('getAdminStats')
                    ->once()
                    ->andReturnUsing(fn (): array => [
                        'pending' => 1,
                        'totalPending' => 100,
                        'paidThisMonth' => 500,
                    ]);
            }),
        );

        $this->app->instance(
            RefundService::class,
            Mockery::mock(RefundService::class, function ($mock) use ($refunds) {
                $mock->shouldReceive('getPendingRefunds')->once()->andReturn($refunds);
                $mock->shouldReceive('getRefundStats')
                    ->once()
                    ->andReturnUsing(fn (): array => [
                        'pending' => 1,
                        'approved' => 0,
                        'rejected' => 0,
                        'totalRefunded' => 0,
                    ]);
            }),
        );

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/finance?tab=refunds');

        $response->assertOk()
            ->assertJsonPath('activeTab', 'refunds')
            ->assertJsonStructure([
                'payouts' => [
                    '*' => [
                        'id',
                        'teacher' => ['id', 'name', 'email'],
                        'amount',
                        'status',
                        'requestedAt',
                        'processedAt',
                    ],
                ],
                'payoutStats' => [
                    'pending',
                    'totalPending',
                    'paidThisMonth',
                ],
                'payoutPagination' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
                'refunds',
                'refundStats' => [
                    'pending',
                    'approved',
                    'rejected',
                    'totalRefunded',
                ],
                'refundPagination' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_non_admin_cannot_view_unified_finance_workspace(): void
    {
        $response = $this->actingAs($this->teacher)
            ->getJson('/admin/finance');

        $response->assertForbidden();
    }
}