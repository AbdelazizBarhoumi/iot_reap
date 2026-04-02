<?php

namespace App\Services;

use App\Jobs\GenerateCertificatePdfJob;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use App\Repositories\CertificateRepository;
use App\Repositories\LessonProgressRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class CertificateService
{
    public function __construct(
        private CertificateRepository $certificateRepository,
        private LessonProgressRepository $progressRepository,
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
     * Get user's certificate for a course.
     */
    public function getUserCertificateForCourse(User $user, int $courseId): ?Certificate
    {
        return $this->certificateRepository->getUserCertificateForCourse($user, $courseId);
    }

    /**
     * Check if user has completed a course and can receive a certificate.
     */
    public function canIssueCertificate(User $user, Course $course): bool
    {
        // Check if already has certificate
        if ($this->certificateRepository->hasCertificate($user, $course->id)) {
            return false;
        }

        // Check if course is completed (100% progress)
        $progress = $this->progressRepository->getCourseProgressPercentage($user, $course->id);

        return $progress >= 100;
    }

    /**
     * Issue a certificate for completing a course.
     *
     * @throws AuthorizationException
     */
    public function issueCertificate(User $user, int $courseId): Certificate
    {
        $course = Course::findOrFail($courseId);

        // Verify completion
        if (! $this->canIssueCertificate($user, $course)) {
            throw new AuthorizationException('Cannot issue certificate. Course not completed or already issued.');
        }

        // Generate unique hash
        $hash = $this->generateUniqueHash();

        // Create certificate record
        $certificate = $this->certificateRepository->create([
            'user_id' => $user->id,
            'course_id' => $courseId,
            'hash' => $hash,
            'issued_at' => now(),
        ]);

        // Execute PDF generation synchronously
        GenerateCertificatePdfJob::dispatchSync($certificate);

        return $certificate->load(['user:id,name', 'course:id,title']);
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

        return storage_path("app/{$certificate->pdf_path}");
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
