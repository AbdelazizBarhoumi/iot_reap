<?php

namespace App\Services;

use App\Events\CertificateIssued;
use App\Jobs\GenerateCertificatePdfJob;
use App\Models\Certificate;
use App\Models\TrainingPath;
use App\Models\User;
use App\Repositories\CertificateRepository;
use App\Repositories\TrainingUnitProgressRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CertificateService
{
    public function __construct(
        private CertificateRepository $certificateRepository,
        private TrainingUnitProgressRepository $progressRepository,
    ) {}

    /**
     * Get all certificates for a user.
     */
    public function getUserCertificates(User $user): Collection
    {
        return $this->certificateRepository->getUserCertificates($user);
    }

    /**
     * Get certificate by verification hash.
     *
     * @deprecated Unused - candidate for removal. Use verifyCertificate() instead.
     */
    public function getCertificateByHash(string $hash): ?Certificate
    {
        return $this->certificateRepository->findByHash($hash);
    }

    /**
     * Get user's certificate for a trainingPath.
     */
    public function getUserCertificateForTrainingPath(User $user, int $trainingPathId): ?Certificate
    {
        return $this->certificateRepository->getUserCertificateForTrainingPath($user, $trainingPathId);
    }

    /**
     * Ensure a certificate has a generated PDF when possible.
     */
    public function ensureCertificatePdf(Certificate $certificate): Certificate
    {
        $pdfPath = $this->getCertificatePdfPath($certificate);

        if ($pdfPath && file_exists($pdfPath)) {
            return $certificate->fresh(['user:id,name', 'trainingPath:id,title,thumbnail,instructor_id']) ?? $certificate;
        }

        try {
            GenerateCertificatePdfJob::dispatchSync($certificate);
        } catch (\Throwable $e) {
            report($e);
        }

        return $certificate->fresh(['user:id,name', 'trainingPath:id,title,thumbnail,instructor_id']) ?? $certificate;
    }

    /**
     * Check if user has completed a trainingPath and can receive a certificate.
     */
    public function canIssueCertificate(User $user, TrainingPath $trainingPath): bool
    {
        // Check if already has certificate
        if ($this->certificateRepository->hasCertificate($user, $trainingPath->id)) {
            return false;
        }

        // Check if trainingPath is completed (100% progress)
        $progress = $this->progressRepository->getTrainingPathProgressPercentage($user, $trainingPath->id);

        return $progress >= 100;
    }

    /**
     * Issue a certificate for completing a trainingPath.
     *
     * @throws AuthorizationException
     */
    public function issueCertificate(User $user, int $trainingPathId): Certificate
    {
        $trainingPath = TrainingPath::findOrFail($trainingPathId);

        $existingCertificate = $this->certificateRepository->getUserCertificateForTrainingPath($user, $trainingPathId);

        if ($existingCertificate) {
            return $this->ensureCertificatePdf($existingCertificate);
        }

        // Verify completion
        if (! $this->canIssueCertificate($user, $trainingPath)) {
            throw new AuthorizationException('Cannot issue certificate. TrainingPath not completed or already issued.');
        }

        // Generate unique hash
        $hash = $this->generateUniqueHash();

        // Create certificate record
        $certificate = $this->certificateRepository->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPathId,
            'hash' => $hash,
            'issued_at' => now(),
        ]);

        $certificate = $this->ensureCertificatePdf($certificate);

        // Dispatch event
        CertificateIssued::dispatch($certificate);

        return $certificate->load(['user:id,name', 'trainingPath:id,title,thumbnail']);
    }

    /**
     * Check if a certificate hash is valid.
     */
    public function verifyCertificate(string $hash): ?Certificate
    {
        return $this->certificateRepository->findByHash($hash);
    }

    /**
     * Get certificate PDF path for download.
     */
    public function getCertificatePdfPath(Certificate $certificate): ?string
    {
        if (! $certificate->pdf_path) {
            return null;
        }

        return Storage::disk(config('filesystems.default'))->path($certificate->pdf_path);
    }

    /**
     * Generate a unique verification hash.
     */
    private function generateUniqueHash(): string
    {
        do {
            $hash = Str::random(64);
        } while (Certificate::where('hash', $hash)->exists());

        return $hash;
    }
}
