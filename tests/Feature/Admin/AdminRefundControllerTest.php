<?php

namespace Tests\Feature\Admin;

use App\Models\Payment;
use App\Models\RefundRequest;
use App\Models\User;
use App\Services\RefundService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Pagination\LengthAwarePaginator;
use Mockery;
use Tests\TestCase;

class AdminRefundControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    private Payment $payment;

    private RefundRequest $refundRequest;

    private $refundServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->student = User::factory()->engineer()->create();
        $this->payment = Payment::factory()->completed()->create(['user_id' => $this->student->id]);
        $this->refundRequest = RefundRequest::factory()->pending()->forPayment($this->payment)->create();

        // Mock RefundService
        $this->refundServiceMock = Mockery::mock(RefundService::class);
        $this->app->instance(RefundService::class, $this->refundServiceMock);
    }

    public function test_admin_can_list_pending_refunds(): void
    {
        $refunds = new LengthAwarePaginator(
            [$this->refundRequest], // items
            1, // total
            20, // perPage
            1, // currentPage
            ['path' => request()->url()]
        );

        $this->refundServiceMock
            ->shouldReceive('getPendingRefunds')
            ->once()
            ->andReturn($refunds);

        $this->refundServiceMock
            ->shouldReceive('getRefundStats')
            ->once()
            ->andReturn([]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/refunds');

        $response->assertOk()
            ->assertJsonStructure([
                'refunds',
                'pagination' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_admin_can_list_refunds_with_pagination(): void
    {
        $refunds = new LengthAwarePaginator(
            [], // items
            0, // total
            10, // perPage
            1, // currentPage
            ['path' => request()->url()]
        );

        $this->refundServiceMock
            ->shouldReceive('getPendingRefunds')
            ->once()
            ->andReturn($refunds);

        $this->refundServiceMock
            ->shouldReceive('getRefundStats')
            ->once()
            ->andReturn([]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/refunds?per_page=10');

        $response->assertOk();
    }

    public function test_non_admin_cannot_list_refunds(): void
    {
        $response = $this->actingAs($this->student)
            ->getJson('/admin/refunds');

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_list_refunds(): void
    {
        $response = $this->getJson('/admin/refunds');

        $response->assertUnauthorized();
    }

    public function test_admin_can_approve_refund(): void
    {
        $approvedRefund = $this->refundRequest;

        $this->refundServiceMock
            ->shouldReceive('approveRefund')
            ->once()
            ->andReturn($approvedRefund);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/refunds/{$this->refundRequest->id}/approve", [
                'admin_notes' => 'Refund approved - valid reason provided',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Refund approved and processed successfully.',
            ])
            ->assertJsonStructure([
                'refund',
            ]);
    }

    public function test_admin_can_approve_refund_without_notes(): void
    {
        $approvedRefund = $this->refundRequest;

        $this->refundServiceMock
            ->shouldReceive('approveRefund')
            ->once()
            ->andReturn($approvedRefund);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/refunds/{$this->refundRequest->id}/approve");

        $response->assertOk();
    }

    public function test_approve_refund_handles_domain_exception(): void
    {
        $this->refundServiceMock
            ->shouldReceive('approveRefund')
            ->once()
            ->andThrow(new \DomainException('Refund has already been processed'));

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/refunds/{$this->refundRequest->id}/approve");

        $response->assertUnprocessable()
            ->assertJson([
                'message' => 'Refund has already been processed',
            ]);
    }

    public function test_admin_can_reject_refund(): void
    {
        $rejectedRefund = $this->refundRequest;

        $this->refundServiceMock
            ->shouldReceive('rejectRefund')
            ->once()
            ->andReturn($rejectedRefund);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/refunds/{$this->refundRequest->id}/reject", [
                'reason' => 'Does not meet refund policy criteria',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Refund request rejected.',
            ])
            ->assertJsonStructure([
                'refund',
            ]);
    }

    public function test_reject_refund_validates_reason(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/admin/refunds/{$this->refundRequest->id}/reject", [
                'reason' => '', // Required field
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['reason']);
    }

    public function test_reject_refund_handles_domain_exception(): void
    {
        $this->refundServiceMock
            ->shouldReceive('rejectRefund')
            ->once()
            ->andThrow(new \DomainException('Cannot reject already processed refund'));

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/refunds/{$this->refundRequest->id}/reject", [
                'reason' => 'Invalid reason',
            ]);

        $response->assertUnprocessable()
            ->assertJson([
                'message' => 'Cannot reject already processed refund',
            ]);
    }

    public function test_admin_can_get_all_refunds(): void
    {
        $refunds = collect([$this->refundRequest]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/refunds/all');

        $response->assertOk()
            ->assertJsonStructure([
                'refunds',
                'pagination' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_admin_can_get_all_refunds_with_status_filter(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/admin/refunds/all?status=approved');

        $response->assertOk();
    }

    public function test_admin_can_get_all_refunds_with_pagination(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/admin/refunds/all?per_page=5');

        $response->assertOk();
    }

    public function test_validate_admin_notes_length(): void
    {
        $longNotes = str_repeat('a', 1001); // Over 1000 chars

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/refunds/{$this->refundRequest->id}/approve", [
                'admin_notes' => $longNotes,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['admin_notes']);
    }

    public function test_validate_rejection_reason_length(): void
    {
        $longReason = str_repeat('a', 1001); // Over 1000 chars

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/refunds/{$this->refundRequest->id}/reject", [
                'reason' => $longReason,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['reason']);
    }

    public function test_non_admin_cannot_approve_refund(): void
    {
        $response = $this->actingAs($this->student)
            ->postJson("/admin/refunds/{$this->refundRequest->id}/approve");

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_reject_refund(): void
    {
        $response = $this->actingAs($this->student)
            ->postJson("/admin/refunds/{$this->refundRequest->id}/reject", [
                'reason' => 'Should not work',
            ]);

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_get_all_refunds(): void
    {
        $response = $this->actingAs($this->student)
            ->getJson('/admin/refunds/all');

        $response->assertForbidden();
    }

    public function test_refund_not_found_returns_404(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/refunds/999/approve');

        $response->assertNotFound();
    }

    public function test_refund_not_found_reject_returns_404(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/refunds/999/reject', [
                'reason' => 'Test reason',
            ]);

        $response->assertNotFound();
    }
}
