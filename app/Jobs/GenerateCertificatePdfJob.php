<?php

namespace App\Jobs;

use App\Models\Certificate;
use App\Repositories\CertificateRepository;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GenerateCertificatePdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public Certificate $certificate,
    ) {}

    public function handle(CertificateRepository $certificateRepository): void
    {
        try {
            // Load relationships
            $this->certificate->loadMissing(['user', 'trainingPath.instructor']);

            // Generate PDF
            $pdf = Pdf::loadView('certificates.template', [
                'certificate' => $this->certificate,
                'user' => $this->certificate->user,
                'trainingPath' => $this->certificate->trainingPath,
                'instructor' => $this->certificate->trainingPath->instructor,
                'issuedAt' => $this->certificate->issued_at,
                'verificationUrl' => $this->certificate->verification_url,
            ]);

            $pdf->setPaper('A4', 'landscape');

            // Store PDF
            $filename = "certificates/{$this->certificate->hash}.pdf";
            Storage::put($filename, $pdf->output());

            // Update certificate with PDF path
            $certificateRepository->updatePdfPath($this->certificate, $filename);

            Log::info('Certificate PDF generated', [
                'certificate_id' => $this->certificate->id,
                'path' => $filename,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate certificate PDF', [
                'certificate_id' => $this->certificate->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Certificate PDF generation job failed permanently', [
            'certificate_id' => $this->certificate->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
