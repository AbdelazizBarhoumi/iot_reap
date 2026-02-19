<?php

namespace App\Listeners;

use App\Events\VMSessionActivated;
use App\Enums\VMSessionStatus;
use App\Exceptions\GuacamoleApiException;
use App\Services\GuacamoleClientInterface;
use App\Services\GuacamoleConnectionParamsBuilder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener that creates a Guacamole connection when a VM session is activated.
 * Implements ShouldQueue to run asynchronously in the background.
 */
class CreateGuacamoleConnectionListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct(
        private readonly GuacamoleClientInterface $guacamoleClient,
    ) {}

    /**
     * Handle the VMSessionActivated event.
     * Creates a Guacamole connection and updates the session with connection ID.
     */
    public function handle(VMSessionActivated $event): void
    {
        $session = $event->session;

        try {
            // Build protocol-specific connection parameters
            $params = GuacamoleConnectionParamsBuilder::build($session);

            // Create connection in Guacamole
            $connectionId = $this->guacamoleClient->createConnection($params);

            // Update session with Guacamole connection ID
            $session->update([
                'guacamole_connection_id' => $connectionId,
                'status' => VMSessionStatus::ACTIVE,
            ]);

            Log::info('Guacamole connection created for session', [
                'session_id' => $session->id,
                'connection_id' => $connectionId,
                'user_id' => $session->user_id,
                'protocol' => $session->template->protocol->value,
            ]);

            // TODO: Broadcast WebSocket event via Laravel Echo (VMSessionReady)
            // This notifies the frontend that the session is ready for viewing

        } catch (GuacamoleApiException $e) {
            // Mark session as failed due to Guacamole error
            $session->update(['status' => VMSessionStatus::FAILED]);

            Log::error('Failed to create Guacamole connection', [
                'session_id' => $session->id,
                'user_id' => $session->user_id,
                'error' => $e->getMessage(),
            ]);

            // TODO: Notify admin of Guacamole connection failure
            // This should trigger an alert to ops team

        } catch (\Exception $e) {
            // Mark session as failed due to unexpected error
            $session->update(['status' => VMSessionStatus::FAILED]);

            Log::error('Unexpected error in Guacamole connection creation', [
                'session_id' => $session->id,
                'user_id' => $session->user_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
