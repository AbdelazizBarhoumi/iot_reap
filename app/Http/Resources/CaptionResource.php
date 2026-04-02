<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Caption
 */
class CaptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'video_id' => $this->video_id,
            'language' => $this->language,
            'label' => $this->label ?? $this->getLanguageLabel($this->language),
            'file_path' => $this->file_path,
            'file_url' => $this->file_url,
            'is_default' => $this->is_default,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    /**
     * Get a human-readable label for a language code.
     */
    private function getLanguageLabel(string $code): string
    {
        $labels = [
            'en' => 'English',
            'en-US' => 'English (US)',
            'en-GB' => 'English (UK)',
            'ar' => 'العربية',
            'ar-SA' => 'العربية (السعودية)',
            'fr' => 'Français',
            'de' => 'Deutsch',
            'es' => 'Español',
            'pt' => 'Português',
            'zh' => '中文',
            'ja' => '日本語',
            'ko' => '한국어',
        ];

        return $labels[$code] ?? $code;
    }
}
