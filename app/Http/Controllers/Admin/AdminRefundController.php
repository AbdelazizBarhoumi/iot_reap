<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\RefundRequestResource;
use App\Models\RefundRequest;
use App\Services\RefundService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminRefundController extends Controller
{
    public function __construct(
        private readonly RefundService $refundService,
    ) {}

    /**
     * Show pending refund requests for admin review.
     */
    public function index(Request $request): InertiaResponse|JsonResponse
    {
        $perPage = $request->integer('per_page', 20);
        $refunds = $this->refundService->getPendingRefunds($perPage);
        $stats = $this->refundService->getRefundStats();

        $data = [
            'refunds' => RefundRequestResource::collection($refunds),
            'stats' => $stats,
            'pagination' => [
                'current_page' => $refunds->currentPage(),
                'last_page' => $refunds->lastPage(),
                'per_page' => $refunds->perPage(),
                'total' => $refunds->total(),
            ],
        ];

        if ($request->wantsJson()) {
            return response()->json($data);
        }

        return Inertia::render('admin/RefundsPage', $data);
    }

    /**
     * Approve a refund request.
     */
    public function approve(Request $request, RefundRequest $refundRequest): JsonResponse
    {
        $validated = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $refund = $this->refundService->approveRefund(
                $refundRequest,
                $validated['admin_notes'] ?? null
            );

            return response()->json([
                'message' => 'Refund approved and processed successfully.',
                'refund' => new RefundRequestResource($refund),
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reject a refund request.
     */
    public function reject(Request $request, RefundRequest $refundRequest): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        try {
            $refund = $this->refundService->rejectRefund(
                $refundRequest,
                $validated['reason']
            );

            return response()->json([
                'message' => 'Refund request rejected.',
                'refund' => new RefundRequestResource($refund),
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get all refunds with filters.
     */
    public function all(Request $request): JsonResponse
    {
        $query = RefundRequest::with(['user', 'payment.trainingPath']);

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        $refunds = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'refunds' => RefundRequestResource::collection($refunds),
            'pagination' => [
                'current_page' => $refunds->currentPage(),
                'last_page' => $refunds->lastPage(),
                'per_page' => $refunds->perPage(),
                'total' => $refunds->total(),
            ],
        ]);
    }
}
