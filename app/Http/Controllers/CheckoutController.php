<?php

namespace App\Http\Controllers;

use App\Http\Requests\Checkout\InitiateCheckoutRequest;
use App\Http\Requests\Checkout\RequestRefundRequest;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\RefundRequestResource;
use App\Models\TrainingPath;
use App\Models\Payment;
use App\Repositories\PaymentRepository;
use App\Services\CheckoutService;
use App\Services\RefundService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        protected CheckoutService $checkoutService,
        protected RefundService $refundService,
        protected PaymentRepository $paymentRepository
    ) {}

    /**
     * Initiate checkout for a trainingPath.
     */
    public function checkout(InitiateCheckoutRequest $request): JsonResponse
    {
        $trainingPath = TrainingPath::findOrFail($request->validated('training_path_id'));
        $user = $request->user();

        try {
            $result = $this->checkoutService->createCheckoutSession($user, $trainingPath);

            if (isset($result['enrolled'])) {
                // Free trainingPath - enrolled directly
                return response()->json([
                    'enrolled' => true,
                    'redirect_url' => $result['training_path_url'],
                ]);
            }

            return response()->json([
                'session_id' => $result['session_id'],
                'checkout_url' => $result['checkout_url'],
            ]);
        } catch (\DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Checkout success page.
     */
    public function success(): Response
    {
        $sessionId = request('session_id');
        $payment = $sessionId
            ? $this->checkoutService->getPaymentBySessionId($sessionId)
            : null;

        return Inertia::render('checkout/success', [
            'payment' => $payment ? new PaymentResource($payment) : null,
        ]);
    }

    /**
     * Checkout cancelled page.
     */
    public function cancelled(): Response
    {
        $trainingPathId = request('trainingPath');
        $trainingPath = $trainingPathId ? TrainingPath::find($trainingPathId) : null;

        return Inertia::render('checkout/cancelled', [
            'trainingPath' => $trainingPath ? [
                'id' => $trainingPath->id,
                'title' => $trainingPath->title,
            ] : null,
        ]);
    }

    /**
     * Get user's payment history.
     */
    public function payments(): Response
    {
        $payments = $this->paymentRepository->getByUser(auth()->user());

        return Inertia::render('checkout/payments', [
            'payments' => PaymentResource::collection($payments),
        ]);
    }

    /**
     * Request a refund.
     */
    public function requestRefund(RequestRefundRequest $request): JsonResponse
    {
        // SECURITY: Scope payment lookup to current user to prevent IDOR
        $payment = Payment::where('user_id', $request->user()->id)
            ->findOrFail($request->validated('payment_id'));
        $reason = $request->validated('reason');

        try {
            $refundRequest = $this->refundService->requestRefund(
                $request->user(),
                $payment,
                $reason
            );

            return response()->json([
                'refund_request' => new RefundRequestResource($refundRequest),
                'message' => 'Your refund request has been submitted.',
            ], 201);
        } catch (\DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Get user's refund requests.
     */
    public function refunds(): Response
    {
        $refunds = $this->refundService->getUserRefundRequests(auth()->user());

        return Inertia::render('checkout/refunds', [
            'refunds' => RefundRequestResource::collection($refunds),
        ]);
    }
}
