<?php

namespace Tests\Unit\Listeners;

use App\Events\CertificateIssued;
use App\Listeners\SendCertificateIssuedNotification;
use App\Models\Certificate;
use App\Models\TrainingPath;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class SendCertificateIssuedNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_sends_notification(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create(['title' => 'Test Path']);
        $certificate = Certificate::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'hash' => 'test-hash-123',
        ]);

        $notificationService = Mockery::mock(NotificationService::class);
        $notificationService->shouldReceive('notifyCertificateReady')
            ->once()
            ->with(Mockery::on(fn ($u) => $u->id === $user->id), 'Test Path', 'test-hash-123');

        $listener = new SendCertificateIssuedNotification($notificationService);
        $event = new CertificateIssued($certificate);

        $listener->handle($event);

        $this->assertTrue(true); // Assertion happens in Mockery
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
