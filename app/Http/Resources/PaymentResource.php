<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Payment
 */
class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'trainingPath' => [
                'id' => $this->training_path_id,
                'title' => $this->trainingPath->title,
                'thumbnail_url' => $this->trainingPath->thumbnail_url,
            ],
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'amount' => $this->amount,
            'formatted_amount' => $this->formatted_amount,
            'currency' => $this->currency,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'is_refundable' => $this->isRefundable(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
