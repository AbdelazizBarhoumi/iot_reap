<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\RefundRequest
 */
class RefundRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'reason' => $this->reason,
            'admin_notes' => $this->when($request->user()?->hasRole('admin'), $this->admin_notes),
            'refund_amount' => $this->refund_amount,
            'processed_at' => $this->processed_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
