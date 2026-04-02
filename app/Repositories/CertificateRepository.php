<?php

namespace App\Repositories;

use App\Models\Certificate;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CertificateRepository
{
    /**
     * Get all certificates for a user.
     */
    public function getUserCertificates(User $user): Collection
    {
        return Certificate::where('user_id', $user->id)
            ->with('course:id,title,thumbnail,instructor_id')
            ->orderBy('issued_at', 'desc')
            ->get();
    }

    /**
     * Get certificate by ID.
     *
     * @deprecated Unused - route model binding handles this. Candidate for removal.
     */
    public function find(int $id): ?Certificate
    {
        return Certificate::find($id);
    }

    /**
     * Get certificate by hash.
     */
    public function findByHash(string $hash): ?Certificate
    {
        return Certificate::byHash($hash)
            ->with(['user:id,name', 'course:id,title,instructor_id'])
            ->first();
    }

    /**
     * Get user's certificate for a specific course.
     */
    public function getUserCertificateForCourse(User $user, int $courseId): ?Certificate
    {
        return Certificate::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->first();
    }

    /**
     * Check if user has certificate for a course.
     */
    public function hasCertificate(User $user, int $courseId): bool
    {
        return Certificate::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->exists();
    }

    /**
     * Create a new certificate.
     */
    public function create(array $data): Certificate
    {
        return Certificate::create($data);
    }

    /**
     * Update certificate PDF path.
     *
     * @deprecated Unused - Certificate model updated directly in job. Candidate for removal.
     */
    public function updatePdfPath(Certificate $certificate, string $pdfPath): Certificate
    {
        $certificate->update(['pdf_path' => $pdfPath]);

        return $certificate->fresh();
    }

    /**
     * Delete a certificate.
     *
     * @deprecated Unused - no certificate deletion feature implemented. Candidate for removal.
     */
    public function delete(Certificate $certificate): bool
    {
        return $certificate->delete();
    }
}
