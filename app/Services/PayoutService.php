<?php

namespace App\Services;

use App\Enums\PayoutStatus;
use App\Models\PayoutRequest;
use App\Models\User;
use App\Notifications\PayoutApprovedNotification;
use App\Notifications\PayoutRejectedNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;
use Stripe\Transfer;

/**
 * Service for managing teacher payout requests.
 */
class PayoutService
{
    /**
     * Minimum payout amount in cents.
     */
    private const MIN_PAYOUT_CENTS = 5000; // $50 minimum

    public function __construct(
        private readonly RevenueService $revenueService,
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Request a payout for a teacher's available balance.
     *
     * @planned Not yet integrated into teacher dashboard UI. Will be added for payout self-service.
     *
     * @throws \DomainException
     */
    public function requestPayout(
        User $teacher,
        int $amountCents,
        string $payoutMethod = 'stripe',
        ?array $payoutDetails = null,
    ): PayoutRequest {
        // Validate minimum amount
        if ($amountCents < self::MIN_PAYOUT_CENTS) {
            throw new \DomainException('Minimum payout amount is $'.(self::MIN_PAYOUT_CENTS / 100));
        }

        // Check available balance
        $availableBalance = $this->getAvailableBalance($teacher);
        if ($amountCents > $availableBalance) {
            throw new \DomainException('Requested amount exceeds available balance.');
        }

        // Check for pending requests
        if ($this->hasPendingRequest($teacher)) {
            throw new \DomainException('You already have a pending payout request.');
        }

        $request = PayoutRequest::create([
            'user_id' => $teacher->id,
            'amount_cents' => $amountCents,
            'currency' => 'USD',
            'status' => PayoutStatus::PENDING,
            'payout_method' => $payoutMethod,
            'payout_details' => $payoutDetails,
        ]);

        Log::info('Payout requested', [
            'payout_request_id' => $request->id,
            'user_id' => $teacher->id,
            'amount_cents' => $amountCents,
        ]);

        return $request;
    }

    /**
     * Approve a payout request (admin action).
     */
    public function approvePayout(PayoutRequest $request, User $admin, ?string $notes = null): PayoutRequest
    {
        if (! $request->isPending()) {
            throw new \DomainException('Only pending requests can be approved.');
        }

        $request->update([
            'status' => PayoutStatus::APPROVED,
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'admin_notes' => $notes,
        ]);

        Log::info('Payout approved', [
            'payout_request_id' => $request->id,
            'admin_id' => $admin->id,
        ]);

        // Notify the teacher
        $request->user->notify(new PayoutApprovedNotification($request));

        return $request->fresh();
    }

    /**
     * Reject a payout request (admin action).
     */
    public function rejectPayout(PayoutRequest $request, User $admin, string $reason): PayoutRequest
    {
        if (! $request->isPending()) {
            throw new \DomainException('Only pending requests can be rejected.');
        }

        $request->update([
            'status' => PayoutStatus::REJECTED,
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);

        Log::info('Payout rejected', [
            'payout_request_id' => $request->id,
            'admin_id' => $admin->id,
            'reason' => $reason,
        ]);

        // Notify the teacher
        $request->user->notify(new PayoutRejectedNotification($request, $reason));

        return $request->fresh();
    }

    /**
     * Process an approved payout via Stripe Transfer.
     *
     * @throws \DomainException
     */
    public function processPayout(PayoutRequest $request): PayoutRequest
    {
        if (! $request->canProcess()) {
            throw new \DomainException('Only approved payouts can be processed.');
        }

        $request->update([
            'status' => PayoutStatus::PROCESSING,
            'processed_at' => now(),
        ]);

        try {
            // Get teacher's Stripe connected account ID
            $teacher = $request->user;
            $stripeAccountId = $teacher->stripe_connect_account_id ?? null;

            if (! $stripeAccountId) {
                throw new \DomainException('Teacher has not connected their Stripe account.');
            }

            // Create Stripe Transfer
            $transfer = Transfer::create([
                'amount' => $request->amount_cents,
                'currency' => strtolower($request->currency),
                'destination' => $stripeAccountId,
                'metadata' => [
                    'payout_request_id' => $request->id,
                    'teacher_id' => $teacher->id,
                ],
            ]);

            $request->update([
                'status' => PayoutStatus::COMPLETED,
                'stripe_transfer_id' => $transfer->id,
                'completed_at' => now(),
            ]);

            Log::info('Payout completed', [
                'payout_request_id' => $request->id,
                'stripe_transfer_id' => $transfer->id,
            ]);
        } catch (ApiErrorException $e) {
            $request->update([
                'status' => PayoutStatus::FAILED,
                'admin_notes' => "Stripe error: {$e->getMessage()}",
            ]);

            Log::error('Payout failed', [
                'payout_request_id' => $request->id,
                'error' => $e->getMessage(),
            ]);

            throw new \DomainException("Payout failed: {$e->getMessage()}");
        }

        return $request->fresh();
    }

    /**
     * Get pending payout requests for admin review.
     */
    public function getPendingPayouts(int $perPage = 20): LengthAwarePaginator
    {
        return PayoutRequest::pending()
            ->with(['user:id,name,email'])
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
    }

    /**
     * Get payout history for a teacher.
     *
     * @planned Not yet integrated into teacher earnings page. Will be added for payout self-service.
     */
    public function getTeacherPayouts(User $teacher): Collection
    {
        return PayoutRequest::where('user_id', $teacher->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get available balance for a teacher.
     *
     * @planned Used internally by requestPayout(). Will be exposed when payout self-service is added.
     */
    public function getAvailableBalance(User $teacher): int
    {
        $totalEarnings = (int) ($this->revenueService->getTotalRevenue($teacher) * 100);
        $totalPaidOut = $this->getTotalPaidOut($teacher);
        $pendingPayouts = $this->getPendingPayoutAmount($teacher);

        return max(0, $totalEarnings - $totalPaidOut - $pendingPayouts);
    }

    /**
     * Get total amount already paid out to teacher.
     */
    private function getTotalPaidOut(User $teacher): int
    {
        return PayoutRequest::where('user_id', $teacher->id)
            ->where('status', PayoutStatus::COMPLETED)
            ->sum('amount_cents') ?? 0;
    }

    /**
     * Get pending payout amount for teacher.
     */
    private function getPendingPayoutAmount(User $teacher): int
    {
        return PayoutRequest::where('user_id', $teacher->id)
            ->whereIn('status', [PayoutStatus::PENDING, PayoutStatus::APPROVED, PayoutStatus::PROCESSING])
            ->sum('amount_cents') ?? 0;
    }

    /**
     * Get admin dashboard statistics for payouts.
     *
     * @return array{pending: int, totalPending: int, paidThisMonth: int}
     */
    public function getAdminStats(): array
    {
        $pendingCount = PayoutRequest::pending()->count();
        $totalPendingAmount = PayoutRequest::pending()->sum('amount_cents') ?? 0;
        $paidThisMonth = PayoutRequest::where('status', PayoutStatus::COMPLETED)
            ->whereMonth('completed_at', now()->month)
            ->whereYear('completed_at', now()->year)
            ->sum('amount_cents') ?? 0;

        return [
            'pending' => $pendingCount,
            'totalPending' => intdiv($totalPendingAmount, 100), // Convert cents to dollars for display
            'paidThisMonth' => intdiv($paidThisMonth, 100),
        ];
    }

    /**
     * Check if teacher has a pending payout request.
     */
    private function hasPendingRequest(User $teacher): bool
    {
        return PayoutRequest::where('user_id', $teacher->id)
            ->whereIn('status', [PayoutStatus::PENDING, PayoutStatus::APPROVED, PayoutStatus::PROCESSING])
            ->exists();
    }
}
