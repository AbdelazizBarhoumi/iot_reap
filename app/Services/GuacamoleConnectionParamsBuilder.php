<?php

namespace App\Services;

use App\Enums\VMSessionProtocol;
use App\Models\User;
use App\Models\VMSession;
use App\Repositories\UserConnectionPreferenceRepository;
use App\Repositories\UserVMConnectionDefaultProfileRepository;
use RuntimeException;

/**
 * Builds protocol-specific Guacamole connection parameters for a VM session.
 *
 * Rules:
 *  - The Guacamole hostname is ALWAYS $session->ip_address (the VM's DHCP-assigned IP).
 *    It is never manually configured and can change between boots.
 *  - User's saved preferences (from guacamole_connection_preferences table) are applied
 *    on top of hardcoded sensible defaults. User settings win.
 *  - When the user has no saved preferences, sensible defaults are used as-is.
 */
class GuacamoleConnectionParamsBuilder
{
    public function __construct(
        private readonly UserConnectionPreferenceRepository $preferenceRepository,
        private readonly UserVMConnectionDefaultProfileRepository $vmDefaultRepository,
    ) {}

    /**
     * Build a full Guacamole connection params array for the given session and user.
     *
     * Prerequisite: $session->ip_address MUST already be populated (via ProxmoxIPResolver).
     *
     * @return array<string, mixed>
     *
     * @throws RuntimeException When ip_address is null or the protocol is unsupported.
     */
    public function buildParams(VMSession $session, User $user): array
    {
        if (empty($session->ip_address)) {
            throw new RuntimeException(
                "Cannot build connection params: vm_sessions.ip_address is null for session {$session->id}. "
                .'ProxmoxIPResolver must resolve the VM IP before calling buildParams().'
            );
        }

        // Use session's effective protocol (now stored directly on session)
        $protocol = $session->getProtocol();

        // Load user's saved preferences for this protocol.
        // Precedence order:
        // 1. Session-level selected profile (user chose during launch)
        // 2. Per-VM default profile (user's preferred profile for THIS VM)
        // 3. Protocol-level default profile (user's fallback for RDP/VNC/SSH)
        // 4. Hardcoded sensible defaults (if no profiles exist)
        $preference = null;
        
        // 1. Check session-level selection
        if (! empty($session->connection_profile_name)) {
            $preference = $this->preferenceRepository->findByProfile(
                $user,
                $protocol->value,
                $session->connection_profile_name,
            );
        }

        // 2. Check per-VM default (if session selection didn't match)
        if (! $preference && ! empty($session->vm_id)) {
            $vmDefault = $this->vmDefaultRepository->findPerVMDefault($user, $session->vm_id, $protocol->value);
            if ($vmDefault) {
                $preference = $this->preferenceRepository->findByProfile(
                    $user,
                    $protocol->value,
                    $vmDefault->preferred_profile_name,
                );
            }
        }

        // 3. Fall back to protocol-level default
        if (! $preference) {
            $preference = $this->preferenceRepository->findByUser($user, $protocol->value);
        }

        $userSettings = $preference?->parameters ?? [];

        return match ($protocol) {
            VMSessionProtocol::RDP => $this->buildRDPParams($session->ip_address, $session, $userSettings),
            VMSessionProtocol::VNC => $this->buildVNCParams($session->ip_address, $session, $userSettings),
            VMSessionProtocol::SSH => $this->buildSSHParams($session->ip_address, $session, $userSettings),
            default => throw new RuntimeException("Unsupported protocol: {$protocol->value}"),
        };
    }

    /**
     * Get session-level credentials (username/password stored on the session).
     *
     * @return array{username?: string, password?: string}
     */
    private function getSessionCredentials(VMSession $session): array
    {
        return $session->credentials ?? [];
    }

    /**
     * Build RDP connection parameters, merging user settings over sensible defaults.
     *
     * @param  array<string, mixed>  $userSettings
     * @return array<string, mixed>
     */
    private function buildRDPParams(string $hostname, VMSession $session, array $userSettings): array
    {
        $rdpConfig = config('guacamole.protocols.rdp', []);

        $defaults = [
            // Concurrency / attributes
            'max-connections' => '',
            'max-connections-per-user' => '2',
            'weight' => '',
            'failover-only' => 'false',
            'guacd-hostname' => '',
            'guacd-port' => '',
            'guacd-encryption' => 'none',

            // Network
            'hostname' => $hostname,
            'port' => (string) ($rdpConfig['port'] ?? 3389),
            'timeout' => '10',

            // Authentication
            'username' => '',
            'password' => '',
            'domain' => '',
            'security' => $rdpConfig['security'] ?? 'nla',
            'ignore-cert' => filter_var($rdpConfig['ignore_cert'] ?? true, FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false',
            'cert-tofu' => 'false',
            'cert-fingerprints' => '',
            'disable-auth' => 'false',

            // Session
            'client-name' => 'guacamole',
            'console' => 'false',
            'initial-program' => '',
            'server-layout' => 'en-us-qwerty',
            'timezone' => 'Africa/Tunis',

            // Display
            'color-depth' => '24',
            'width' => '1920',
            'height' => '1080',
            'dpi' => '96',
            'resize-method' => $rdpConfig['resize_method'] ?? 'display-update',
            'force-lossless' => 'false',

            // Clipboard
            'normalize-clipboard' => 'preserve',
            'disable-copy' => 'false',
            'disable-paste' => 'false',

            // Device Redirection
            'disable-audio' => 'false',
            'enable-audio-input' => 'false',
            'enable-touch' => 'false',
            'console-audio' => 'false',
            'enable-printing' => 'false',
            'printer-name' => '',
            'enable-drive' => 'false',
            'drive-name' => 'Guacamole Drive',
            'drive-path' => '/tmp/guacamole-drive',
            'create-drive-path' => 'false',
            'disable-download' => 'false',
            'disable-upload' => 'false',
            'static-channels' => '',

            // Preconnection / gateway / load balancing
            'preconnection-id' => '',
            'preconnection-blob' => '',
            'gateway-hostname' => '',
            'gateway-port' => '443',
            'gateway-username' => '',
            'gateway-password' => '',
            'gateway-domain' => '',
            'load-balance-info' => '',

            // Performance
            'enable-wallpaper' => 'false',
            'enable-theming' => 'false',
            'enable-font-smoothing' => 'true',
            'enable-full-window-drag' => 'false',
            'enable-desktop-composition' => 'false',
            'enable-menu-animations' => 'false',
            'disable-bitmap-caching' => 'false',
            'disable-offscreen-caching' => 'false',
            'disable-glyph-caching' => 'false',
            'disable-gfx' => 'false',

            // RemoteApp
            'remote-app' => '',
            'remote-app-dir' => '',
            'remote-app-args' => '',

            // SFTP
            'enable-sftp' => 'false',
            'sftp-hostname' => '',
            'sftp-port' => '22',
            'sftp-timeout' => '10',
            'sftp-host-key' => '',
            'sftp-username' => '',
            'sftp-password' => '',
            'sftp-private-key' => '',
            'sftp-passphrase' => '',
            'sftp-directory' => '',
            'sftp-root-directory' => '/',
            'sftp-server-alive-interval' => '0',
            'sftp-disable-download' => 'false',
            'sftp-disable-upload' => 'false',

            // Recording
            'recording-path' => '',
            'create-recording-path' => 'false',
            'recording-name' => 'recording',
            'recording-exclude-output' => 'false',
            'recording-exclude-mouse' => 'false',
            'recording-include-keys' => 'false',

            // Wake-on-LAN
            'wol-send-packet' => 'false',
            'wol-mac-addr' => '',
            'wol-broadcast-addr' => '255.255.255.255',
            'wol-udp-port' => '9',
            'wol-wait-time' => '0',
        ];

        $merged = array_merge($defaults, $this->sanitizeUserSettings($userSettings));
        $merged['hostname'] = $hostname; // Always the VM's dynamic IP — never overridable by user

        // Override with session-level credentials if provided
        $creds = $this->getSessionCredentials($session);
        if (! empty($creds['username'])) {
            $merged['username'] = $creds['username'];
        }
        if (! empty($creds['password'])) {
            $merged['password'] = $creds['password'];
        }

        return [
            'name' => "session-{$session->id}",
            'protocol' => 'rdp',
            'parameters' => $merged,
        ];
    }

    /**
     * Build VNC connection parameters, merging user settings over sensible defaults.
     *
     * @param  array<string, mixed>  $userSettings
     * @return array<string, mixed>
     */
    private function buildVNCParams(string $hostname, VMSession $session, array $userSettings): array
    {
        $vncConfig = config('guacamole.protocols.vnc', []);

        $defaults = [
            'hostname' => $hostname,
            'port' => (string) ($vncConfig['port'] ?? 5900),
            'autoretry' => '',
            'username' => '',
            'password' => '',
            'read-only' => 'false',
            'disable-server-input' => 'false',
            'disable-display-resize' => 'false',
            'swap-red-blue' => 'false',
            'cursor' => '',
            'encodings' => '',
            'width' => '1280',
            'height' => '720',
            'dpi' => '96',
            'color-depth' => '32',
            'force-lossless' => 'false',
            'compress-level' => '',
            'quality-level' => '',
            'dest-host' => '',
            'dest-port' => '',
            'reverse-connect' => 'false',
            'listen-timeout' => '',
            'enable-audio' => 'false',
            'audio-servername' => '',
            'clipboard-encoding' => '',
            'timeout' => '10',
        ];

        $merged = array_merge($defaults, $this->sanitizeUserSettings($userSettings));
        $merged['hostname'] = $hostname;

        // Override with session-level credentials if provided (VNC uses password only)
        $creds = $this->getSessionCredentials($session);
        if (! empty($creds['password'])) {
            $merged['password'] = $creds['password'];
        }

        return [
            'name' => "session-{$session->id}",
            'protocol' => 'vnc',
            'parameters' => $merged,
        ];
    }

    /**
     * Build SSH connection parameters, merging user settings over sensible defaults.
     *
     * @param  array<string, mixed>  $userSettings
     * @return array<string, mixed>
     */
    private function buildSSHParams(string $hostname, VMSession $session, array $userSettings): array
    {
        $sshConfig = config('guacamole.protocols.ssh', []);

        $defaults = [
            'hostname' => $hostname,
            'port' => (string) ($sshConfig['port'] ?? 22),
            'timeout' => '10',
            'host-key' => '',
            'server-alive-interval' => '',
            'username' => '',
            'password' => '',
            'private-key' => '',
            'public-key' => '',
            'passphrase' => '',
            'command' => '',
            'locale' => '',
            'timezone' => '',
            'font-size' => '12',
            'color-scheme' => 'gray-black',
            'enable-sftp' => 'true',
            'sftp-root-directory' => '/home',
            'sftp-disable-download' => 'false',
            'sftp-disable-upload' => 'false',
        ];

        $merged = array_merge($defaults, $this->sanitizeUserSettings($userSettings));
        $merged['hostname'] = $hostname;

        // Override with session-level credentials if provided
        $creds = $this->getSessionCredentials($session);
        if (! empty($creds['username'])) {
            $merged['username'] = $creds['username'];
        }
        if (! empty($creds['password'])) {
            $merged['password'] = $creds['password'];
        }

        return [
            'name' => "session-{$session->id}",
            'protocol' => 'ssh',
            'parameters' => $merged,
        ];
    }

    /**
     * Sanitize user-supplied settings before merging into params.
     *
     * - Removes 'hostname' (always the VM's IP, never user-overridable).
     * - Casts booleans and numbers to the string format Guacamole expects.
     * - Silently skips arrays / objects (not valid Guacamole param values).
     *
     * @param  array<string, mixed>  $settings
     * @return array<string, string>
     */
    private function sanitizeUserSettings(array $settings): array
    {
        unset($settings['hostname']); // Enforced — always the VM's dynamic IP

        $result = [];
        foreach ($settings as $key => $value) {
            if (is_bool($value)) {
                $result[(string) $key] = $value ? 'true' : 'false';
            } elseif (is_int($value) || is_float($value)) {
                $result[(string) $key] = (string) $value;
            } elseif (is_string($value)) {
                $result[(string) $key] = $value;
            }
            // Arrays/objects are silently dropped
        }

        return $result;
    }
}
