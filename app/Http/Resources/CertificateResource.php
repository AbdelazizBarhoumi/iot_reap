<?php

namespace App\Http\Resources;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Certificate
 */
class CertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'hash' => $this->hash,
            'issued_at' => $this->issued_at->toISOString(),
            'verification_url' => $this->verification_url,
            'download_url' => $this->download_url,
            'has_pdf' => ! is_null($this->pdf_path),
            'trainingPath' => $this->whenLoaded('trainingPath', fn () => [
                'id' => $this->trainingPath->id,
                'title' => $this->trainingPath->title,
                'thumbnail' => $this->trainingPath->thumbnail,
            ]),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
        ];
    }
}
