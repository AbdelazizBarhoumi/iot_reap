<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\RefundRequestResource;
use App\Models\PayoutRequest;
use App\Models\RefundRequest;
use App\Services\PayoutService;
use App\Services\RefundService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminFinanceController extends Controller
{
    public function __construct(
        private readonly PayoutService $payoutService,
        private readonly RefundService $refundService,
    ) {}

    /**
     * Show payouts and refunds in a single admin finance workspace.
     */
    public function index(Request $request): InertiaResponse|JsonResponse
    {
        $perPage = $request->integer('per_page', 20);
        $activeTab = $request->string('tab')->toString();

        if (! in_array($activeTab, ['payouts', 'refunds'], true)) {
            $activeTab = $request->is('admin/refunds*') ? 'refunds' : 'payouts';
        }

        $payoutsPaginator = $this->payoutService->getPendingPayouts($perPage);
        $refundsPaginator = $this->refundService->getPendingRefunds($perPage);

        $payouts = collect($payoutsPaginator->items())
            ->map(function (PayoutRequest $payout): array {
                return [
                    'id' => (string) $payout->id,
                    'teacher' => [
                        'id' => $payout->user->id,
                        'name' => $payout->user->name,
                        'email' => $payout->user->email,
                    ],
                    'amount' => $payout->amount_cents / 100,
                    'status' => match ($payout->status->value) {
                        'pending' => 'pending',
                        'approved' => 'approved',
                        'processing' => 'approved',
                        'completed' => 'paid',
                        'rejected' => 'rejected',
                        'failed' => 'rejected',
                        default => 'pending',
                    },
                    'requestedAt' => $payout->created_at->format(DATE_ATOM),
                    'processedAt' => $payout->processed_at?->format(DATE_ATOM),
                ];
            })
            ->all();

        $refunds = RefundRequestResource::collection($refundsPaginator);

        $data = [
            'activeTab' => $activeTab,
            'payouts' => $payouts,
            'payoutStats' => $this->payoutService->getAdminStats(),
            'payoutPagination' => [
                'current_page' => $payoutsPaginator->currentPage(),
                'last_page' => $payoutsPaginator->lastPage(),
                'per_page' => $payoutsPaginator->perPage(),
                'total' => $payoutsPaginator->total(),
            ],
            'refunds' => $refunds,
            'refundStats' => $this->refundService->getRefundStats(),
            'refundPagination' => [
                'current_page' => $refundsPaginator->currentPage(),
                'last_page' => $refundsPaginator->lastPage(),
                'per_page' => $refundsPaginator->perPage(),
                'total' => $refundsPaginator->total(),
            ],
        ];

        if ($request->wantsJson()) {
            if ($request->is('admin/payouts*')) {
                return response()->json([
                    'payouts' => $payouts,
                    'stats' => $data['payoutStats'],
                    'pagination' => $data['payoutPagination'],
                ]);
            }

            if ($request->is('admin/refunds*')) {
                return response()->json([
                    'refunds' => $refunds,
                    'stats' => $data['refundStats'],
                    'pagination' => $data['refundPagination'],
                ]);
            }

            return response()->json($data);
        }

        return Inertia::render('admin/FinancePage', $data);
    }
}