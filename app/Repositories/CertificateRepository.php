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
            ->with('trainingPath:id,title,thumbnail,instructor_id')
            ->orderBy('issued_at', 'desc')
            ->get();
    }

    /**
     * Get certificate by hash.
     */
    public function findByHash(string $hash): ?Certificate
    {
        return Certificate::byHash($hash)
            ->with(['user:id,name', 'trainingPath:id,title,thumbnail,instructor_id'])
            ->first();
    }

    /**
     * Get user's certificate for a specific trainingPath.
     */
    public function getUserCertificateForTrainingPath(User $user, int $trainingPathId): ?Certificate
    {
        return Certificate::where('user_id', $user->id)
            ->where('training_path_id', $trainingPathId)
            ->first();
    }

    /**
     * Check if user has certificate for a trainingPath.
     */
    public function hasCertificate(User $user, int $trainingPathId): bool
    {
        return Certificate::where('user_id', $user->id)
            ->where('training_path_id', $trainingPathId)
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
     */
    public function updatePdfPath(Certificate $certificate, string $pdfPath): bool
    {
        return $certificate->update(['pdf_path' => $pdfPath]);
    }
}
