<?php

namespace App\Http\Controllers;

use App\Http\Resources\CertificateResource;
use App\Services\CertificateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CertificateController extends Controller
{
    public function __construct(
        private CertificateService $certificateService,
    ) {}

    /**
     * Get user's certificates.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $certificates = $this->certificateService->getUserCertificates($request->user());

        if ($request->wantsJson()) {
            return response()->json([
                'data' => CertificateResource::collection($certificates),
            ]);
        }

        return Inertia::render('certificates/index', [
            'certificates' => CertificateResource::collection($certificates),
        ]);
    }

    /**
     * Issue a certificate for a completed trainingPath.
     */
    public function store(Request $request, int $trainingPathId): JsonResponse
    {
        $certificate = $this->certificateService->issueCertificate(
            user: $request->user(),
            trainingPathId: $trainingPathId,
        );

        return response()->json([
            'data' => new CertificateResource($certificate),
            'message' => 'Certificate issued successfully. PDF is being generated.',
        ], 201);
    }

    /**
     * Check if user can receive a certificate for a trainingPath.
     */
    public function check(Request $request, int $trainingPathId): JsonResponse
    {
        $certificate = $this->certificateService->getUserCertificateForTrainingPath(
            $request->user(),
            $trainingPathId,
        );

        if ($certificate) {
            return response()->json([
                'has_certificate' => true,
                'data' => new CertificateResource($certificate->load('trainingPath')),
            ]);
        }

        return response()->json([
            'has_certificate' => false,
            'data' => null,
        ]);
    }

    /**
     * Verify a certificate (public).
     */
    public function verify(string $hash): InertiaResponse|JsonResponse
    {
        $certificate = $this->certificateService->verifyCertificate($hash);

        if (! $certificate) {
            if (request()->wantsJson()) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Certificate not found.',
                ], 404);
            }

            return Inertia::render('certificates/verify', [
                'valid' => false,
                'certificate' => null,
            ]);
        }

        $data = [
            'valid' => true,
            'certificate' => new CertificateResource($certificate),
        ];

        if (request()->wantsJson()) {
            return response()->json($data);
        }

        return Inertia::render('certificates/verify', $data);
    }

    /**
     * Download certificate PDF.
     */
    public function download(string $hash): BinaryFileResponse|JsonResponse
    {
        $certificate = $this->certificateService->verifyCertificate($hash);

        if (! $certificate) {
            return response()->json([
                'message' => 'Certificate not found.',
            ], 404);
        }

        $pdfPath = $this->certificateService->getCertificatePdfPath($certificate);

        if (! $pdfPath || ! file_exists($pdfPath)) {
            return response()->json([
                'message' => 'Certificate PDF is not ready. Please try again later.',
            ], 404);
        }

        $filename = "Certificate-{$certificate->trainingPath->title}.pdf";

        return response()->download($pdfPath, $filename);
    }
}
