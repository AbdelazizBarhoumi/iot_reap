<?php

namespace App\Jobs;

use App\Enums\UsbDeviceStatus;
use App\Events\UsbDeviceAttachmentProgress;
use App\Exceptions\GatewayApiException;
use App\Models\UsbDevice;
use App\Models\VMSession;
use App\Services\GatewayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Asynchronous USB device attachment job.
 *
 * Windows USB/IP driver loading takes ~90 seconds, which is too long
 * for a synchronous HTTP request. This job runs the attachment in the
 * background and broadcasts progress events to the frontend.
 *
 * Events broadcasted:
 * - UsbDeviceAttachmentProgress with status: started, binding, attaching, completed, failed
 */
class AttachUsbDeviceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 1;

    /**
     * The number of seconds the job can run before timing out.
     * Windows driver loading can take up to 120 seconds.
     */
    public int $timeout = 180;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly UsbDevice $device,
        public readonly VMSession $session,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(GatewayService $gatewayService): void
    {
        $deviceId = $this->device->id;
        $sessionId = $this->session->id;

        Log::info('AttachUsbDeviceJob: Starting async attachment', [
            'device_id' => $deviceId,
            'session_id' => $sessionId,
        ]);

        // Broadcast started event
        $this->broadcastProgress('started', 'Initiating USB device attachment...');

        try {
            // Refresh models to get latest state
            $device = $this->device->fresh(['gatewayNode']);
            $session = $this->session->fresh(['node', 'proxmoxServer']);

            if (! $device || ! $session) {
                throw new GatewayApiException('Device or session no longer exists');
            }

            // Check if device is still in attachable state
            if ($device->isAttached()) {
                $this->broadcastProgress('completed', 'Device is already attached');

                return;
            }

            // Ensure device is bound
            if ($device->isAvailable()) {
                $this->broadcastProgress('binding', 'Binding device for USB/IP sharing...');
                $gatewayService->bindDevice($device);
                $device->refresh();
            }

            // Attach to session
            $this->broadcastProgress('attaching', 'Attaching device to VM (this may take up to 2 minutes for Windows)...');
            $gatewayService->attachToSession($device, $session);

            // Success
            $device->refresh();
            $this->broadcastProgress('completed', 'Device attached successfully', [
                'status' => $device->status->value,
                'port' => $device->usbip_port,
            ]);

            Log::info('AttachUsbDeviceJob: Attachment completed', [
                'device_id' => $deviceId,
                'session_id' => $sessionId,
                'port' => $device->usbip_port,
            ]);

        } catch (GatewayApiException $e) {
            Log::error('AttachUsbDeviceJob: Attachment failed', [
                'device_id' => $deviceId,
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);

            $this->broadcastProgress('failed', $e->getMessage());

            // Re-throw to mark job as failed
            throw $e;
        } catch (\Throwable $e) {
            Log::error('AttachUsbDeviceJob: Unexpected error', [
                'device_id' => $deviceId,
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->broadcastProgress('failed', 'Unexpected error: '.$e->getMessage());

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(?\Throwable $exception): void
    {
        Log::error('AttachUsbDeviceJob: Job failed permanently', [
            'device_id' => $this->device->id,
            'session_id' => $this->session->id,
            'error' => $exception?->getMessage(),
        ]);

        // Ensure device is in a clean state
        $device = $this->device->fresh();
        if ($device && $device->status === UsbDeviceStatus::ATTACHED && ! $device->attached_session_id) {
            // Device was partially attached - reset to bound
            $device->update([
                'status' => UsbDeviceStatus::BOUND,
                'attached_to' => null,
                'attached_session_id' => null,
            ]);
        }

        $this->broadcastProgress('failed', $exception?->getMessage() ?? 'Job failed');
    }

    /**
     * Broadcast attachment progress event.
     */
    private function broadcastProgress(string $status, string $message, array $extra = []): void
    {
        try {
            event(new UsbDeviceAttachmentProgress(
                deviceId: $this->device->id,
                sessionId: $this->session->id,
                status: $status,
                message: $message,
                extra: $extra
            ));
        } catch (\Throwable $e) {
            // Don't fail the job if broadcasting fails
            Log::warning('Failed to broadcast attachment progress', [
                'device_id' => $this->device->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
