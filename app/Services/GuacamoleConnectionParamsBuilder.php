<?php

namespace App\Services;

use App\Enums\VMTemplateProtocol;
use App\Models\VMSession;
use RuntimeException;

/**
 * Builds protocol-specific connection parameters for Guacamole.
 * Translates VM session details into the format expected by Guacamole API.
 */
class GuacamoleConnectionParamsBuilder
{
    /**
     * Build connection parameters for a VM session.
     * Returns array structured for Guacamole REST API createConnection payload.
     *
     * @return array<string, mixed>
     *
     * @throws RuntimeException
     */
    public static function build(VMSession $session): array
    {
        $protocol = $session->template->protocol;
        $hostname = $session->ip_address ?? 'localhost';

        return match ($protocol) {
            VMTemplateProtocol::RDP => self::buildRDPParams($hostname, $session),
            VMTemplateProtocol::VNC => self::buildVNCParams($hostname, $session),
            VMTemplateProtocol::SSH => self::buildSSHParams($hostname, $session),
            default => throw new RuntimeException("Unsupported protocol: {$protocol->value}"),
        };
    }

    /**
     * Build RDP (Remote Desktop Protocol) connection parameters.
     *
     * @return array<string, mixed>
     */
    private static function buildRDPParams(string $hostname, VMSession $session): array
    {
        $rdpConfig = config('guacamole.protocols.rdp');

        return [
            'name' => "session-{$session->id}",
            'protocol' => 'rdp',
            'parameters' => [
                'hostname' => $hostname,
                'port' => (string) $rdpConfig['port'],
                'username' => env('RDP_USERNAME', 'Administrator'),
                'password' => env('RDP_PASSWORD', 'Password123!'),
                'security' => $rdpConfig['security'],
                'ignore-cert' => $rdpConfig['ignore_cert'] ? 'true' : 'false',
                'resize-method' => $rdpConfig['resize_method'],
                'enable-drive' => 'true',
                'drive-path' => '/tmp/guacamole',
                'enable-printing' => 'true',
                'printer-name' => 'Guacamole Printer',
            ],
        ];
    }

    /**
     * Build VNC (Virtual Network Computing) connection parameters.
     *
     * @return array<string, mixed>
     */
    private static function buildVNCParams(string $hostname, VMSession $session): array
    {
        $vncConfig = config('guacamole.protocols.vnc');

        return [
            'name' => "session-{$session->id}",
            'protocol' => 'vnc',
            'parameters' => [
                'hostname' => $hostname,
                'port' => (string) $vncConfig['port'],
                'password' => env('VNC_PASSWORD', 'vncpassword'),
                'read-only' => $vncConfig['read_only'] ? 'true' : 'false',
                'enable-sound' => 'false',
            ],
        ];
    }

    /**
     * Build SSH (Secure Shell) connection parameters.
     *
     * @return array<string, mixed>
     */
    private static function buildSSHParams(string $hostname, VMSession $session): array
    {
        $sshConfig = config('guacamole.protocols.ssh');

        return [
            'name' => "session-{$session->id}",
            'protocol' => 'ssh',
            'parameters' => [
                'hostname' => $hostname,
                'port' => (string) $sshConfig['port'],
                'username' => env('SSH_USERNAME', 'ubuntu'),
                'password' => env('SSH_PASSWORD', ''),
                'private-key' => env('SSH_PRIVATE_KEY', ''),
                'passphrase' => env('SSH_PASSPHRASE', ''),
                'enable-sftp' => 'true',
                'enable-sftp-upload' => 'true',
                'enable-sftp-download' => 'true',
            ],
        ];
    }
}
