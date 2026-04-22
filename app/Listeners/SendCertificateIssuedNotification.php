<?php

namespace App\Listeners;

use App\Events\CertificateIssued;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendCertificateIssuedNotification implements ShouldQueue
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function handle(CertificateIssued $event): void
    {
        $certificate = $event->certificate;
        $certificate->loadMissing(['user', 'trainingPath']);

        $this->notificationService->notifyCertificateReady(
            $certificate->user,
            $certificate->trainingPath->title,
            $certificate->hash
        );
    }
}
