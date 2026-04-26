<?php

namespace App\Http\Resources;

use App\Models\RefundRequest;
use App\Support\CurrencyFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin RefundRequest
 */
class RefundRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $payment = $this->relationLoaded('payment') ? $this->payment : null;
        $trainingPath = $payment?->trainingPath;

        return [
            'id' => $this->id,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'trainingPath' => $trainingPath ? [
                'id' => $trainingPath->id,
                'title' => $trainingPath->title,
            ] : null,
            'amount' => $payment?->amount,
            'formattedAmount' => $payment?->formatted_amount,
            'currency' => $payment?->currency,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'reason' => $this->reason,
            'admin_notes' => $this->when($request->user()?->hasRole('admin'), $this->admin_notes),
            'refund_amount' => $this->refund_amount,
            'formattedRefundAmount' => $this->refund_amount !== null
                ? CurrencyFormatter::format($this->refund_amount, $payment?->currency)
                : null,
            'requestedAt' => $this->created_at->toIso8601String(),
            'processedAt' => $this->processed_at?->toIso8601String(),
        ];
    }
}
