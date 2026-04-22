<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\PayoutRequest
 */
class PayoutRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => $this->amount,
            'amount_cents' => $this->amount_cents,
            'currency' => $this->currency,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'payout_method' => $this->payout_method,
            'payout_details' => $this->payout_details,
            'rejection_reason' => $this->rejection_reason,
            'admin_notes' => $this->admin_notes,
            'requestedAt' => $this->created_at->toIso8601String(),
            'approvedAt' => $this->approved_at?->format(DATE_ATOM),
            'processedAt' => $this->processed_at?->format(DATE_ATOM),
            'completedAt' => $this->completed_at?->format(DATE_ATOM),
        ];
    }
}
