<?php

namespace App\Http\Requests\TrainingPath;

use App\Enums\TrainingPathLevel;
use App\Models\TrainingPath;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

/**
 * Form request for updating a trainingPath.
 */
class UpdateTrainingPathRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var TrainingPath|null $trainingPath */
        $trainingPath = $this->route('trainingPath');

        if (! $trainingPath) {
            return false;
        }

        // Owner or admin can update
        return $trainingPath->isOwnedBy($this->user()) || $this->user()->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'category' => ['sometimes', 'string', 'max:100'],
            'level' => ['sometimes', Rule::enum(TrainingPathLevel::class)],
            'price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'nullable', 'string', 'size:3'],
            'is_free' => ['sometimes', 'boolean'],
            'thumbnail' => [
                'nullable',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if ($value instanceof UploadedFile) {
                        if (! $value->isValid()) {
                            $fail('The thumbnail upload is invalid.');

                            return;
                        }

                        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

                        if (! in_array($value->getMimeType(), $allowedMimes, true)) {
                            $fail('The thumbnail must be a JPG, PNG, GIF, or WEBP image.');
                        }

                        if (($value->getSize() ?? 0) > 5 * 1024 * 1024) {
                            $fail('The thumbnail may not be greater than 5MB.');
                        }

                        return;
                    }

                    if (! is_string($value)) {
                        $fail('The thumbnail must be an image upload, URL, or base64 data URL.');

                        return;
                    }

                    if (str_starts_with($value, 'data:image/')) {
                        if (! preg_match('/^data:image\/([a-zA-Z0-9.+-]+);base64,/', $value, $matches)) {
                            $fail('The thumbnail data URL format is invalid.');

                            return;
                        }

                        if (! in_array(strtolower($matches[1]), ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
                            $fail('The thumbnail must be a JPG, PNG, GIF, or WEBP image.');

                            return;
                        }

                        $base64 = substr($value, strpos($value, ',') + 1);
                        $decoded = base64_decode(str_replace(' ', '+', $base64), true);

                        if ($decoded === false) {
                            $fail('The thumbnail data URL could not be decoded.');

                            return;
                        }

                        if (strlen($decoded) > 5 * 1024 * 1024) {
                            $fail('The thumbnail may not be greater than 5MB.');
                        }

                        return;
                    }

                    if (! filter_var($value, FILTER_VALIDATE_URL) && ! str_starts_with($value, '/storage/')) {
                        $fail('The thumbnail must be a valid URL or base64 image.');
                    }
                },
            ],
            'duration' => ['nullable', 'string', 'max:50'],
        ];
    }
}
