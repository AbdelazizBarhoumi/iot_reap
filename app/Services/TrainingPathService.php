<?php

namespace App\Services;

use App\Enums\TrainingPathStatus;
use App\Enums\TrainingUnitVMAssignmentStatus;
use App\Models\TrainingPath;
use App\Models\User;
use App\Notifications\TrainingPathApprovedNotification;
use App\Notifications\TrainingPathRejectedNotification;
use App\Repositories\TrainingPathModuleRepository;
use App\Repositories\TrainingPathRepository;
use App\Repositories\TrainingUnitRepository;
use App\Repositories\TrainingUnitVMAssignmentRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Service for trainingPath management.
 */
class TrainingPathService
{
    public function __construct(
        private readonly TrainingPathRepository $trainingPathRepository,
        private readonly TrainingPathModuleRepository $moduleRepository,
        private readonly TrainingUnitRepository $trainingUnitRepository,
        private readonly TrainingUnitVMAssignmentRepository $vmAssignmentRepository,
        private readonly TrainingPathCacheService $cacheService,
    ) {}

    /**
     * Get all approved trainingPaths for browsing (cached for 15 minutes).
     */
    public function getApprovedTrainingPaths(?string $category = null, ?string $search = null): Collection
    {
        if ($search) {
            return $this->trainingPathRepository->searchApproved($search);
        }

        if ($category) {
            return $this->cacheService->rememberApprovedByCategory(
                $category,
                fn () => $this->trainingPathRepository->findApprovedByCategory($category)
            );
        }

        return $this->cacheService->rememberApprovedTrainingPaths(
            fn () => $this->trainingPathRepository->findApproved()
        );
    }

    /**
     * Get all available categories (cached for 1 hour).
     *
     * @return array<string>
     */
    public function getCategories(): array
    {
        return $this->cacheService->rememberCategories(
            fn () => $this->trainingPathRepository->getCategories()
        );
    }

    /**
     * Get a trainingPath by ID with full content (cached for 30 minutes).
     */
    public function getTrainingPathWithContent(int $id): ?TrainingPath
    {
        return $this->cacheService->rememberTrainingPathContent(
            $id,
            fn () => $this->trainingPathRepository->findByIdWithContent($id)
        );
    }

    /**
     * Get trainingPaths by instructor.
     */
    public function getTrainingPathsByInstructor(User $user): Collection
    {
        return $this->trainingPathRepository->findByInstructor($user);
    }

    /**
     * Get the instructor's average completion rate across all trainingPaths.
     */
    public function getInstructorCompletionRate(User $user): float
    {
        return $this->trainingPathRepository->getInstructorCompletionRate($user);
    }

    /**
     * Create a new trainingPath with modules and trainingUnits.
     *
     * @param  array<string, mixed>  $data  TrainingPath data
     * @param  array<array<string, mixed>>  $modules  Module data with trainingUnits
     */
    public function createTrainingPath(User $instructor, array $data, array $modules = []): TrainingPath
    {
        // Process thumbnail
        $thumbnailPath = $this->processThumbnail($data['thumbnail'] ?? null);
        $pricingData = $this->buildPricingData($data);

        // Create the trainingPath
        $trainingPath = $this->trainingPathRepository->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'objectives' => $data['objectives'] ?? null,
            'instructor_id' => $instructor->id,
            'thumbnail' => $thumbnailPath,
            'video_type' => $data['video_type'] ?? null,
            'video_url' => $data['video_url'] ?? null,
            'category' => $data['category'] ?? 'General',
            'level' => $data['level'] ?? 'Beginner',
            'duration' => $data['duration'] ?? null,
            ...$pricingData,
            'has_virtual_machine' => false,
            'status' => TrainingPathStatus::DRAFT,
        ]);

        Log::info('TrainingPath created', [
            'training_path_id' => $trainingPath->id,
            'instructor_id' => $instructor->id,
        ]);

        // Create modules and trainingUnits
        $hasVm = false;
        foreach ($modules as $sortOrder => $moduleData) {
            $module = $this->moduleRepository->create([
                'training_path_id' => $trainingPath->id,
                'title' => $moduleData['title'] ?? 'Untitled Module',
                'sort_order' => $sortOrder,
            ]);

            foreach (($moduleData['trainingUnits'] ?? []) as $trainingUnitOrder => $trainingUnitData) {
                $vmEnabled = $trainingUnitData['vm_enabled'] ?? $trainingUnitData['vmEnabled'] ?? false;
                if ($vmEnabled) {
                    $hasVm = true;
                }

                $trainingUnit = $this->trainingUnitRepository->create([
                    'module_id' => $module->id,
                    'title' => $trainingUnitData['title'] ?? 'Untitled TrainingUnit',
                    'type' => $trainingUnitData['type'] ?? 'video',
                    'duration' => $trainingUnitData['duration'] ?? null,
                    'content' => $trainingUnitData['content'] ?? null,
                    'objectives' => $trainingUnitData['objectives'] ?? null,
                    'vm_enabled' => $vmEnabled,
                    'video_url' => $trainingUnitData['video_url'] ?? null,
                    'resources' => $trainingUnitData['resources'] ?? null,
                    'sort_order' => $trainingUnitOrder,
                ]);

                // Handle VM assignment if provided
                if ($vmEnabled && ! empty($trainingUnitData['vm_id']) && ! empty($trainingUnitData['node_id'])) {
                    $this->vmAssignmentRepository->create([
                        'training_unit_id' => $trainingUnit->id,
                        'vm_id' => $trainingUnitData['vm_id'],
                        'node_id' => $trainingUnitData['node_id'],
                        'vm_name' => $trainingUnitData['vm_name'] ?? null,
                        'assigned_by' => $instructor->id,
                        'status' => TrainingUnitVMAssignmentStatus::PENDING,
                        'teacher_notes' => $trainingUnitData['teacher_notes'] ?? 'Initial assignment during creation',
                    ]);
                }
            }
        }

        // Update has_virtual_machine flag
        if ($hasVm) {
            $trainingPath->update(['has_virtual_machine' => true]);
        }

        return $trainingPath->fresh(['modules.trainingUnits']);
    }

    /**
     * Update a trainingPath.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateTrainingPath(TrainingPath $trainingPath, array $data): TrainingPath
    {
        $oldCategory = $trainingPath->category;
        $pricingData = $this->buildPricingData($data, $trainingPath);

        if (isset($data['thumbnail'])) {
            $data['thumbnail'] = $this->processThumbnail($data['thumbnail']);
        }

        if (! empty($pricingData)) {
            $data = array_merge($data, $pricingData);
        }

        unset($data['price']);

        $this->trainingPathRepository->update($trainingPath, $data);

        // Refresh VM flag
        $trainingPath->refreshHasVirtualMachine();

        // Invalidate trainingPath caches (handle category change)
        if (isset($data['category']) && $data['category'] !== $oldCategory) {
            $this->cacheService->invalidateTrainingPathWithOldCategory($trainingPath, $oldCategory);
        } else {
            $this->cacheService->invalidateTrainingPath($trainingPath);
        }

        Log::info('TrainingPath updated', ['training_path_id' => $trainingPath->id]);

        return $trainingPath->fresh(['modules.trainingUnits']);
    }

    /**
     * Delete a trainingPath.
     */
    public function deleteTrainingPath(TrainingPath $trainingPath): bool
    {
        Log::info('Deleting trainingPath', ['training_path_id' => $trainingPath->id]);

        // Invalidate caches before deletion (while we still have trainingPath data)
        $this->cacheService->invalidateTrainingPath($trainingPath);

        return $this->trainingPathRepository->delete($trainingPath);
    }

    /**
     * Submit a trainingPath for review.
     */
    public function submitForReview(TrainingPath $trainingPath): TrainingPath
    {
        if ($trainingPath->status !== TrainingPathStatus::DRAFT && $trainingPath->status !== TrainingPathStatus::REJECTED) {
            throw new \DomainException('TrainingPath is not in a submittable state');
        }

        Log::info('TrainingPath submitted for review', ['training_path_id' => $trainingPath->id]);

        // Status change logic moved from repository to service
        return $this->trainingPathRepository->update($trainingPath, [
            'status' => TrainingPathStatus::PENDING_REVIEW,
            'admin_feedback' => null,
        ]);
    }

    /**
     * Approve a trainingPath (admin only).
     */
    public function approveTrainingPath(TrainingPath $trainingPath): TrainingPath
    {
        if ($trainingPath->status !== TrainingPathStatus::PENDING_REVIEW) {
            throw new \DomainException('TrainingPath is not pending review');
        }

        Log::info('TrainingPath approved', ['training_path_id' => $trainingPath->id]);

        // Status change logic moved from repository to service
        $trainingPath = $this->trainingPathRepository->update($trainingPath, [
            'status' => TrainingPathStatus::APPROVED,
            'admin_feedback' => null,
        ]);

        // Invalidate caches - trainingPath is now visible in approved lists
        $this->cacheService->invalidateTrainingPath($trainingPath);

        // Notify the teacher that their trainingPath was approved
        $trainingPath->instructor->notify(new TrainingPathApprovedNotification($trainingPath));

        return $trainingPath;
    }

    /**
     * Reject a trainingPath (admin only).
     */
    public function rejectTrainingPath(TrainingPath $trainingPath, string $feedback): TrainingPath
    {
        if ($trainingPath->status !== TrainingPathStatus::PENDING_REVIEW) {
            throw new \DomainException('TrainingPath is not pending review');
        }

        Log::info('TrainingPath rejected', [
            'training_path_id' => $trainingPath->id,
            'feedback' => $feedback,
        ]);

        // Status change logic moved from repository to service
        $updated = $this->trainingPathRepository->update($trainingPath, [
            'status' => TrainingPathStatus::REJECTED,
            'admin_feedback' => $feedback,
        ]);

        // Invalidate cache in case trainingPath was previously approved
        $this->cacheService->invalidateTrainingPath($updated);

        // Notify the teacher that their trainingPath was rejected
        $updated->instructor->notify(new TrainingPathRejectedNotification($updated, $feedback));

        return $updated;
    }

    /**
     * Get all trainingPaths pending review (admin only).
     */
    public function getPendingTrainingPaths(): Collection
    {
        return $this->trainingPathRepository->findPendingReview();
    }

    /**
     * Archive a trainingPath (soft-delete).
     *
     * Archived trainingPaths are hidden from public listings but data is preserved.
     * Only owners and admins can archive trainingPaths.
     */
    public function archiveTrainingPath(TrainingPath $trainingPath): TrainingPath
    {
        if ($trainingPath->status === TrainingPathStatus::ARCHIVED) {
            throw new \DomainException('TrainingPath is already archived');
        }

        Log::info('TrainingPath archived', ['training_path_id' => $trainingPath->id]);

        $trainingPath->update([
            'status' => TrainingPathStatus::ARCHIVED,
            'is_featured' => false,
            'featured_order' => null,
            'featured_at' => null,
        ]);

        // Invalidate caches - trainingPath should no longer appear in listings
        $this->cacheService->invalidateTrainingPath($trainingPath);

        return $trainingPath->fresh();
    }

    /**
     * Restore an archived trainingPath to draft status.
     */
    public function restoreTrainingPath(TrainingPath $trainingPath): TrainingPath
    {
        if ($trainingPath->status !== TrainingPathStatus::ARCHIVED) {
            throw new \DomainException('TrainingPath is not archived');
        }

        Log::info('TrainingPath restored from archive', ['training_path_id' => $trainingPath->id]);

        $trainingPath->update(['status' => TrainingPathStatus::DRAFT]);

        return $trainingPath->fresh();
    }

    /**
     * Save a base64 encoded image to storage and return the URL,
     * or return the original URL if it's already one.
     */
    private function processThumbnail(?string $thumbnail): ?string
    {
        if (empty($thumbnail)) {
            Log::debug('processThumbnail: thumbnail is empty');

            return null;
        }

        Log::debug('processThumbnail: received thumbnail', [
            'length' => strlen($thumbnail),
            'starts_with' => substr($thumbnail, 0, 50),
        ]);

        // If it's a base64 string
        if (preg_match('/^data:image\/(\w+);base64,/', $thumbnail, $type)) {
            $extension = strtolower($type[1]); // jpg, png, gif, jpeg

            if (! in_array($extension, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                Log::warning('Unsupported image type in base64 thumbnail', ['type' => $extension]);

                return null;
            }

            // Extract the base64 content
            $encodedImage = substr($thumbnail, strpos($thumbnail, ',') + 1);
            $encodedImage = str_replace(' ', '+', $encodedImage);
            $thumbnailData = base64_decode($encodedImage);

            if ($thumbnailData === false) {
                Log::error('Failed to decode base64 thumbnail');

                return null;
            }

            $fileName = 'training_path_thumbnails/'.Str::uuid().'.'.$extension;

            Storage::disk('public')->put($fileName, $thumbnailData);

            $url = Storage::url($fileName);
            Log::info('processThumbnail: saved thumbnail', ['url' => $url]);

            return $url;
        }

        Log::debug('processThumbnail: returning as-is (not base64)', ['thumbnail' => $thumbnail]);

        // If it's just a file path/URL or something else, return it as is
        return $thumbnail;
    }

    /**
     * Build pricing fields for create/update requests.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function buildPricingData(array $data, ?TrainingPath $trainingPath = null): array
    {
        $hasPrice = array_key_exists('price', $data);
        $hasCurrency = array_key_exists('currency', $data);
        $hasIsFree = array_key_exists('is_free', $data);

        if ($trainingPath === null) {
            $price = (float) ($data['price'] ?? 0);
            $isFree = (bool) ($data['is_free'] ?? $price <= 0);

            return [
                'price_cents' => $isFree ? 0 : (int) round(max(0, $price) * 100),
                'currency' => strtoupper((string) ($data['currency'] ?? 'USD')),
                'is_free' => $isFree,
            ];
        }

        $pricingData = [];

        if ($hasPrice) {
            $price = (float) $data['price'];
            $isFree = (bool) ($data['is_free'] ?? $price <= 0);

            $pricingData['price_cents'] = $isFree ? 0 : (int) round(max(0, $price) * 100);
            $pricingData['is_free'] = $isFree;
        }

        if ($hasCurrency) {
            $pricingData['currency'] = strtoupper((string) $data['currency']);
        }

        if ($hasIsFree) {
            $pricingData['is_free'] = (bool) $data['is_free'];

            if ($pricingData['is_free'] === true) {
                $pricingData['price_cents'] = 0;
            }
        }

        return $pricingData;
    }
}
