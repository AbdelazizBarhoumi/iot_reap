<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * MQTT service for publishing messages to robots and cameras.
 *
 * Uses HTTP bridge to MQTT broker for simple publish operations.
 * For subscribe/real-time features, use a proper MQTT client library.
 *
 * The gateway container runs mosquitto-clients which exposes an HTTP API
 * for publishing MQTT messages without needing a PHP MQTT library.
 */
class MqttService
{
    private string $host;

    private int $port;

    private ?string $username;

    private ?string $password;

    private string $clientId;

    public function __construct()
    {
        $this->host = config('mqtt.host', '192.168.50.6');
        $this->port = config('mqtt.port', 1883);
        $this->username = config('mqtt.username');
        $this->password = config('mqtt.password');
        $this->clientId = config('mqtt.client_id', 'iot-reap-laravel-'.uniqid());
    }

    /**
     * Publish a message to an MQTT topic.
     *
     * Uses the mosquitto_pub command via the gateway's HTTP API.
     * This avoids the need for a persistent MQTT connection in PHP.
     *
     * @param  string  $topic  The MQTT topic to publish to
     * @param  array|string  $payload  The message payload (arrays are JSON encoded)
     * @param  int  $qos  Quality of Service level (0, 1, or 2)
     * @param  bool  $retain  Whether to retain the message
     * @return bool True if message was published successfully
     */
    public function publish(string $topic, array|string $payload, int $qos = 1, bool $retain = false): bool
    {
        $message = is_array($payload) ? json_encode($payload) : $payload;

        // Try HTTP bridge first (gateway agent endpoint)
        $gatewayUrl = "http://{$this->host}:8000/mqtt/publish";

        try {
            $response = Http::timeout(5)->post($gatewayUrl, [
                'topic' => $topic,
                'message' => $message,
                'qos' => $qos,
                'retain' => $retain,
            ]);

            if ($response->successful()) {
                Log::debug('MQTT message published via HTTP bridge', [
                    'topic' => $topic,
                    'qos' => $qos,
                ]);

                return true;
            }

            Log::warning('MQTT HTTP bridge publish failed', [
                'topic' => $topic,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        } catch (\Exception $e) {
            Log::warning('MQTT HTTP bridge unavailable, falling back to direct', [
                'error' => $e->getMessage(),
            ]);
        }

        // Fallback: try direct MQTT publish using shell command
        return $this->publishViaCli($topic, $message, $qos, $retain);
    }

    /**
     * Publish via mosquitto_pub CLI command.
     *
     * This is a fallback when the HTTP bridge is not available.
     * Requires mosquitto-clients to be installed on the Laravel server.
     */
    private function publishViaCli(string $topic, string $message, int $qos, bool $retain): bool
    {
        $cmd = [
            'mosquitto_pub',
            '-h', $this->host,
            '-p', (string) $this->port,
            '-t', $topic,
            '-m', $message,
            '-q', (string) $qos,
        ];

        if ($this->username && $this->password) {
            $cmd = array_merge($cmd, ['-u', $this->username, '-P', $this->password]);
        }

        if ($retain) {
            $cmd[] = '-r';
        }

        // Add client ID for tracking
        $cmd = array_merge($cmd, ['-i', $this->clientId]);

        $escaped = implode(' ', array_map('escapeshellarg', $cmd));

        exec($escaped.' 2>&1', $output, $exitCode);

        if ($exitCode === 0) {
            Log::debug('MQTT message published via CLI', [
                'topic' => $topic,
                'qos' => $qos,
            ]);

            return true;
        }

        Log::error('MQTT CLI publish failed', [
            'topic' => $topic,
            'exit_code' => $exitCode,
            'output' => implode("\n", $output),
        ]);

        return false;
    }

    /**
     * Publish a camera PTZ command.
     *
     * @param  int  $robotId  The robot ID the camera belongs to
     * @param  string  $direction  Direction: up, down, left, right
     * @param  string  $sessionId  The session controlling the camera
     * @param  int|null  $step  Optional step size (default from config)
     */
    public function publishPtzCommand(
        int $robotId,
        string $direction,
        string $sessionId,
        ?int $step = null
    ): bool {
        $topic = str_replace('{robot_id}', (string) $robotId, config('mqtt.topics.camera_ptz'));

        $payload = [
            'action' => "ptz_{$direction}",
            'params' => [
                'step' => $step ?? config('mqtt.ptz.default_step', 10),
            ],
            'timestamp' => now()->toIso8601String(),
            'session_id' => $sessionId,
        ];

        return $this->publish($topic, $payload, qos: 1);
    }

    /**
     * Publish a general robot command.
     *
     * @param  int  $robotId  The robot ID
     * @param  string  $action  The action to perform
     * @param  array  $params  Optional parameters
     */
    public function publishRobotCommand(int $robotId, string $action, array $params = []): bool
    {
        $topic = str_replace('{robot_id}', (string) $robotId, config('mqtt.topics.robot_command'));

        $payload = [
            'action' => $action,
            'params' => $params,
            'timestamp' => now()->toIso8601String(),
        ];

        return $this->publish($topic, $payload, qos: 1);
    }

    /**
     * Build a topic string from a template.
     *
     * @param  string  $template  Topic template with {placeholders}
     * @param  array<string, string|int>  $replacements  Key-value pairs for replacement
     */
    public function buildTopic(string $template, array $replacements): string
    {
        $topic = $template;
        foreach ($replacements as $key => $value) {
            $topic = str_replace("{{$key}}", (string) $value, $topic);
        }

        return $topic;
    }
}
