<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use App\Services\PayoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminPayoutController extends Controller
{
    public function __construct(
        private readonly PayoutService $payoutService,
    ) {}

    /**
     * Show pending payout requests for admin review.
     */
    public function index(Request $request): InertiaResponse|JsonResponse
    {
        $perPage = $request->integer('per_page', 20);
        $paginatedPayouts = $this->payoutService->getPendingPayouts($perPage);

        // Transform payouts to match React component structure
        $payouts = $paginatedPayouts->map(function (PayoutRequest $payout) {
            return [
                'id' => (string) $payout->id,
                'teacher' => [
                    'id' => $payout->user->id,
                    'name' => $payout->user->name,
                    'email' => $payout->user->email,
                ],
                'amount' => $payout->amount_cents / 100, // Convert cents to dollars
                'status' => match ($payout->status->value) {
                    'pending' => 'pending',
                    'approved' => 'approved',
                    'processing' => 'approved', // Treat processing as approved in UI
                    'completed' => 'paid',
                    'rejected' => 'rejected',
                    'failed' => 'rejected',
                    default => 'pending',
                },
                'requestedAt' => $payout->created_at->toIso8601String(),
                'processedAt' => $payout->processed_at?->toIso8601String() ?? null,
            ];
        })->toArray();

        $stats = $this->payoutService->getAdminStats();

        $data = [
            'payouts' => $payouts,
            'stats' => $stats,
            'pagination' => [
                'current_page' => $paginatedPayouts->currentPage(),
                'last_page' => $paginatedPayouts->lastPage(),
                'per_page' => $paginatedPayouts->perPage(),
                'total' => $paginatedPayouts->total(),
            ],
        ];

        if ($request->wantsJson()) {
            return response()->json($data);
        }

        return Inertia::render('admin/PayoutsPage', $data);
    }

    /**
     * Approve a payout request.
     */
    public function approve(Request $request, PayoutRequest $payoutRequest): JsonResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $payout = $this->payoutService->approvePayout(
                $payoutRequest,
                auth()->user(),
                $validated['notes'] ?? null
            );

            return response()->json([
                'message' => 'Payout approved successfully.',
                'payout' => $payout,
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reject a payout request.
     */
    public function reject(Request $request, PayoutRequest $payoutRequest): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        try {
            $payout = $this->payoutService->rejectPayout(
                $payoutRequest,
                auth()->user(),
                $validated['reason']
            );

            return response()->json([
                'message' => 'Payout request rejected.',
                'payout' => $payout,
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Process an approved payout via Stripe.
     */
    public function process(PayoutRequest $payoutRequest): JsonResponse
    {
        try {
            $payout = $this->payoutService->processPayout($payoutRequest);

            return response()->json([
                'message' => 'Payout processed successfully.',
                'payout' => $payout,
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Export payouts as CSV for accounting.
     */
    public function export(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:pending,approved,paid,rejected'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $query = PayoutRequest::with(['user:id,name,email'])
            ->orderBy('created_at', 'desc');

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['from'])) {
            $query->whereDate('created_at', '>=', $validated['from']);
        }

        if (! empty($validated['to'])) {
            $query->whereDate('created_at', '<=', $validated['to']);
        }

        $payouts = $query->get();

        $filename = 'payouts-export-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($payouts) {
            $handle = fopen('php://output', 'w');

            // CSV header
            fputcsv($handle, [
                'ID',
                'Teacher Name',
                'Teacher Email',
                'Amount',
                'Currency',
                'Status',
                'Payout Method',
                'Stripe Account ID',
                'Transaction ID',
                'Requested At',
                'Processed At',
                'Admin Notes',
            ]);

            // CSV rows
            foreach ($payouts as $payout) {
                fputcsv($handle, [
                    $payout->id,
                    $payout->user->name ?? 'N/A',
                    $payout->user->email ?? 'N/A',
                    number_format($payout->amount_cents / 100, 2),
                    $payout->currency ?? 'USD',
                    $payout->status,
                    $payout->payout_method ?? 'stripe',
                    $payout->stripe_account_id ?? '',
                    $payout->transaction_id ?? '',
                    $payout->created_at->format('Y-m-d H:i:s'),
                    $payout->processed_at?->format('Y-m-d H:i:s') ?? '',
                    $payout->admin_notes ?? '',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
