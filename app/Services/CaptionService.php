<?php

namespace App\Services;

use App\Models\Caption;
use App\Models\Video;
use App\Repositories\CaptionRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Service for video caption/subtitle management.
 */
class CaptionService
{
    private const SUPPORTED_LANGUAGES = [
        'en' => 'English',
        'ar' => 'Arabic',
        'fr' => 'French',
        'es' => 'Spanish',
        'de' => 'German',
        'zh' => 'Chinese',
        'ja' => 'Japanese',
        'ko' => 'Korean',
        'pt' => 'Portuguese',
        'ru' => 'Russian',
    ];

    public function __construct(
        private readonly CaptionRepository $captionRepository,
    ) {}

    /**
     * Upload a caption file for a video.
     */
    public function upload(Video $video, UploadedFile $file, string $language): Caption
    {
        return $this->uploadCaption($video, $file, $language, null);
    }

    /**
     * Upload a caption file for a video with optional custom label.
     */
    public function uploadCaption(
        Video $video,
        UploadedFile $file,
        string $language,
        ?string $label = null,
    ): Caption {
        Log::info('Uploading caption', [
            'video_id' => $video->id,
            'language' => $language,
            'filename' => $file->getClientOriginalName(),
        ]);

        // Check if caption for this language already exists
        $existingCaption = $this->captionRepository->findByVideoAndLanguage($video->id, $language);
        if ($existingCaption) {
            // Delete old file and update record
            Storage::disk($video->storage_disk)->delete($existingCaption->file_path);
        }

        // Convert SRT to VTT if needed
        $content = $file->get();
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === 'srt') {
            $content = $this->convertSrtToVtt($content);
        }

        // Store the caption file
        $filename = "{$language}.vtt";
        $storagePath = "videos/captions/{$video->id}/{$filename}";

        Storage::disk($video->storage_disk)->put($storagePath, $content);

        // Determine label
        $captionLabel = $label ?? (self::SUPPORTED_LANGUAGES[$language] ?? $language);

        // Create or update caption record
        if ($existingCaption) {
            return $this->captionRepository->update($existingCaption, [
                'file_path' => $storagePath,
                'label' => $captionLabel,
            ]);
        }

        // Set as default if it's the first caption
        $isDefault = $this->captionRepository->getForVideo($video->id)->isEmpty();

        return $this->captionRepository->create([
            'video_id' => $video->id,
            'language' => $language,
            'label' => $captionLabel,
            'file_path' => $storagePath,
            'is_default' => $isDefault,
        ]);
    }

    /**
     * Delete a caption (alias for delete).
     */
    public function deleteCaption(Caption $caption): bool
    {
        return $this->delete($caption);
    }

    /**
     * Get all captions for a video.
     */
    public function getCaptions(Video $video): array
    {
        $captions = $this->captionRepository->getForVideo($video->id);

        return $captions->map(function ($caption) {
            return [
                'id' => $caption->id,
                'language' => $caption->language,
                'label' => $caption->label,
                'url' => $caption->url,
                'is_default' => $caption->is_default,
            ];
        })->toArray();
    }

    /**
     * Update caption content.
     */
    public function updateCaption(Caption $caption, string $content): Caption
    {
        Log::info('Updating caption content', ['caption_id' => $caption->id]);

        // Validate VTT format
        if (! $this->isValidVtt($content)) {
            throw new \DomainException('Invalid VTT format');
        }

        $caption->updateContent($content);

        return $caption;
    }

    /**
     * Delete a caption.
     */
    public function delete(Caption $caption): bool
    {
        Log::info('Deleting caption', ['caption_id' => $caption->id]);

        // Eager load video if not already loaded
        if (!$caption->relationLoaded('video')) {
            $caption->load('video');
        }

        $video = $caption->video;

        // Delete file if it exists
        if ($caption->file_path && $video) {
            Storage::disk($video->storage_disk)->delete($caption->file_path);
        }

        // If this was the default, set another caption as default
        if ($caption->is_default && $video) {
            $otherCaption = $this->captionRepository->getForVideo($video->id)
                ->where('id', '!=', $caption->id)
                ->first();

            if ($otherCaption) {
                $otherCaption->setAsDefault();
            }
        }

        return $this->captionRepository->delete($caption);
    }

    /**
     * Set a caption as the default for its video.
     */
    public function setAsDefault(Caption $caption): Caption
    {
        $caption->setAsDefault();

        return $caption->fresh();
    }

    /**
     * Get supported languages.
     */
    public function getSupportedLanguages(): array
    {
        return self::SUPPORTED_LANGUAGES;
    }

    /**
     * Convert SRT format to VTT format.
     */
    private function convertSrtToVtt(string $srtContent): string
    {
        // Add WEBVTT header
        $vtt = "WEBVTT\n\n";

        // Replace SRT timestamp format with VTT format
        // SRT: 00:00:00,000 --> 00:00:00,000
        // VTT: 00:00:00.000 --> 00:00:00.000
        $content = preg_replace('/(\d{2}:\d{2}:\d{2}),(\d{3})/', '$1.$2', $srtContent);

        // Remove sequence numbers
        $content = preg_replace('/^\d+\s*$/m', '', $content);

        // Clean up extra blank lines
        $content = preg_replace('/\n{3,}/', "\n\n", $content);

        return $vtt.trim($content);
    }

    /**
     * Validate VTT format.
     */
    private function isValidVtt(string $content): bool
    {
        // Must start with WEBVTT
        if (! str_starts_with(trim($content), 'WEBVTT')) {
            return false;
        }

        // Must contain at least one timestamp
        if (! preg_match('/\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/', $content)) {
            return false;
        }

        return true;
    }

    /**
     * Parse VTT content into cue objects.
     *
     * @return array<array{start: string, end: string, text: string}>
     */
    public function parseVtt(string $content): array
    {
        $cues = [];
        $pattern = '/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\s*\n([\s\S]*?)(?=\n\n|\n*$)/';

        preg_match_all($pattern, $content, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $cues[] = [
                'start' => $match[1],
                'end' => $match[2],
                'text' => trim($match[3]),
            ];
        }

        return $cues;
    }
}
