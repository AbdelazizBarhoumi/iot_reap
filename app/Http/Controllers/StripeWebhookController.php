<?php

namespace App\Http\Controllers;

use App\Services\StripeWebhookService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    public function __construct(
        protected StripeWebhookService $webhookService
    ) {}

    /**
     * Handle incoming Stripe webhook.
     */
    public function __invoke(Request $request): Response
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        if (! $signature) {
            Log::warning('Stripe webhook received without signature');

            return response('Missing signature', 400);
        }

        try {
            $event = $this->webhookService->constructEvent($payload, $signature);
            $this->webhookService->handleEvent($event);

            return response('OK', 200);
        } catch (\UnexpectedValueException $e) {
            Log::error('Invalid Stripe webhook payload', ['error' => $e->getMessage()]);

            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Invalid Stripe webhook signature', ['error' => $e->getMessage()]);

            return response('Invalid signature', 400);
        } catch (\Exception $e) {
            Log::error('Stripe webhook handling error', ['error' => $e->getMessage()]);

            return response('Webhook error', 500);
        }
    }
}
