<?php

namespace App\Http\Controllers;

use App\Http\Requests\Payout\RequestPayoutRequest;
use App\Http\Resources\PayoutRequestResource;
use App\Services\PayoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherPayoutController extends Controller
{
    public function __construct(
        private readonly PayoutService $payoutService,
    ) {}

    /**
     * Teacher payout dashboard payload.
     */
    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user();

        $payouts = $this->payoutService->getTeacherPayouts($teacher);
        $availableBalanceCents = $this->payoutService->getAvailableBalance($teacher);

        return response()->json([
            'data' => PayoutRequestResource::collection($payouts),
            'available_balance_cents' => $availableBalanceCents,
            'available_balance' => $availableBalanceCents / 100,
        ]);
    }

    /**
     * Submit a new payout request.
     */
    public function store(RequestPayoutRequest $request): JsonResponse
    {
        $payout = $this->payoutService->requestPayout(
            teacher: $request->user(),
            amountCents: (int) round(((float) $request->validated('amount')) * 100),
            payoutMethod: $request->validated('payout_method', 'stripe'),
            payoutDetails: $request->validated('payout_details')
        );

        return response()->json([
            'message' => 'Payout request submitted successfully.',
            'data' => new PayoutRequestResource($payout),
        ], 201);
    }
}
