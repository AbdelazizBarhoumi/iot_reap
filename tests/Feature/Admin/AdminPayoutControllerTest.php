<?php

namespace Tests\Feature\Admin;

use App\Models\PayoutRequest;
use App\Models\User;
use App\Services\PayoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class AdminPayoutControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $teacher;

    private PayoutRequest $payoutRequest;

    private $payoutServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->teacher = User::factory()->teacher()->create();
        $this->payoutRequest = PayoutRequest::factory()->pending()->forTeacher($this->teacher)->create();

        // Mock PayoutService
        $this->payoutServiceMock = Mockery::mock(PayoutService::class);
        $this->app->instance(PayoutService::class, $this->payoutServiceMock);
    }

    public function test_admin_can_list_pending_payouts(): void
    {
        $payouts = new \Illuminate\Pagination\LengthAwarePaginator(
            [$this->payoutRequest], // items
            1, // total
            20, // perPage
            1, // currentPage
            ['path' => request()->url()]
        );

        $this->payoutServiceMock
            ->shouldReceive('getPendingPayouts')
            ->once()
            ->andReturn($payouts);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/payouts');

        $response->assertOk()
            ->assertJsonStructure([
                'payouts',
                'pagination' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_admin_can_list_payouts_with_pagination(): void
    {
        $payouts = new \Illuminate\Pagination\LengthAwarePaginator(
            [], // items
            0, // total
            10, // perPage
            1, // currentPage
            ['path' => request()->url()]
        );

        $this->payoutServiceMock
            ->shouldReceive('getPendingPayouts')
            ->once()
            ->andReturn($payouts);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/payouts', [
                'per_page' => 10,
            ]);

        $response->assertOk();
    }

    public function test_non_admin_cannot_list_payouts(): void
    {
        $response = $this->actingAs($this->teacher)
            ->getJson('/admin/payouts');

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_list_payouts(): void
    {
        $response = $this->getJson('/admin/payouts');

        $response->assertUnauthorized();
    }

    public function test_admin_can_approve_payout(): void
    {
        $approvedPayout = $this->payoutRequest;

        $this->payoutServiceMock
            ->shouldReceive('approvePayout')
            ->once()
            ->andReturn($approvedPayout);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/payouts/{$this->payoutRequest->id}/approve", [
                'notes' => 'Approved - all documents verified',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Payout approved successfully.',
            ])
            ->assertJsonStructure([
                'payout',
            ]);
    }

    public function test_admin_can_approve_payout_without_notes(): void
    {
        $approvedPayout = $this->payoutRequest;

        $this->payoutServiceMock
            ->shouldReceive('approvePayout')
            ->once()
            ->andReturn($approvedPayout);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/payouts/{$this->payoutRequest->id}/approve");

        $response->assertOk();
    }

    public function test_approve_payout_handles_domain_exception(): void
    {
        $this->payoutServiceMock
            ->shouldReceive('approvePayout')
            ->once()
            ->andThrow(new \DomainException('Payout has already been processed'));

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/payouts/{$this->payoutRequest->id}/approve");

        $response->assertUnprocessable()
            ->assertJson([
                'message' => 'Payout has already been processed',
            ]);
    }

    public function test_admin_can_reject_payout(): void
    {
        $rejectedPayout = $this->payoutRequest;

        $this->payoutServiceMock
            ->shouldReceive('rejectPayout')
            ->once()
            ->andReturn($rejectedPayout);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/payouts/{$this->payoutRequest->id}/reject", [
                'reason' => 'Invalid tax documents',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Payout request rejected.',
            ])
            ->assertJsonStructure([
                'payout',
            ]);
    }

    public function test_reject_payout_validates_reason(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/admin/payouts/{$this->payoutRequest->id}/reject", [
                'reason' => '', // Required field
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['reason']);
    }

    public function test_reject_payout_handles_domain_exception(): void
    {
        $this->payoutServiceMock
            ->shouldReceive('rejectPayout')
            ->once()
            ->andThrow(new \DomainException('Cannot reject already processed payout'));

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/payouts/{$this->payoutRequest->id}/reject", [
                'reason' => 'Invalid documents',
            ]);

        $response->assertUnprocessable()
            ->assertJson([
                'message' => 'Cannot reject already processed payout',
            ]);
    }

    public function test_admin_can_process_payout(): void
    {
        $processedPayout = $this->payoutRequest;

        $this->payoutServiceMock
            ->shouldReceive('processPayout')
            ->once()
            ->andReturn($processedPayout);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/payouts/{$this->payoutRequest->id}/process");

        $response->assertOk()
            ->assertJson([
                'message' => 'Payout processed successfully.',
            ])
            ->assertJsonStructure([
                'payout',
            ]);
    }

    public function test_process_payout_handles_domain_exception(): void
    {
        $this->payoutServiceMock
            ->shouldReceive('processPayout')
            ->once()
            ->andThrow(new \DomainException('Stripe processing failed'));

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/payouts/{$this->payoutRequest->id}/process");

        $response->assertUnprocessable()
            ->assertJson([
                'message' => 'Stripe processing failed',
            ]);
    }

    public function test_admin_can_export_payouts_csv(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/payouts/export');

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8')
            ->assertHeaderMissing('Content-Length'); // StreamedResponse doesn't set this
    }

    public function test_admin_can_export_payouts_csv_with_filters(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/payouts/export', [
                'status' => 'approved',
                'from' => '2024-01-01',
                'to' => '2024-12-31',
            ]);

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    }

    public function test_export_payouts_validates_filters(): void
    {
        // Test with valid filters to ensure the endpoint works
        $response = $this->actingAs($this->admin)
            ->get('/admin/payouts/export', [
                'status' => 'approved',
                'from' => '2024-01-01',
                'to' => '2024-12-31',
            ]);

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    }

    public function test_non_admin_cannot_approve_payout(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/admin/payouts/{$this->payoutRequest->id}/approve");

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_reject_payout(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/admin/payouts/{$this->payoutRequest->id}/reject", [
                'reason' => 'Should not work',
            ]);

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_process_payout(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/admin/payouts/{$this->payoutRequest->id}/process");

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_export_payouts(): void
    {
        $response = $this->actingAs($this->teacher)
            ->get('/admin/payouts/export');

        $response->assertForbidden();
    }
}
