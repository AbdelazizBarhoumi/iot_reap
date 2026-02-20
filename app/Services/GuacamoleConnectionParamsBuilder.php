<?php

namespace App\Services;

use App\Enums\VMTemplateProtocol;
use App\Models\User;
use App\Models\VMSession;
use App\Repositories\UserConnectionPreferenceRepository;
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
    ) {}

    /**
     * Build a full Guacamole connection params array for the given session and user.
     *
     * Prerequisite: $session->ip_address MUST already be populated (via ProxmoxIPResolver).
     *
     * @return array<string, mixed>
     *
     * @throws RuntimeException  When ip_address is null or the protocol is unsupported.
     */
    public function buildParams(VMSession $session, User $user): array
    {
        if (empty($session->ip_address)) {
            throw new RuntimeException(
                "Cannot build connection params: vm_sessions.ip_address is null for session {$session->id}. "
                . 'ProxmoxIPResolver must resolve the VM IP before calling buildParams().'
            );
        }

        $protocol = $session->template->protocol;

        // Load user's saved preferences for this protocol (null if none saved)
        $preference    = $this->preferenceRepository->findByUser($user, $protocol->value);
        $userSettings  = $preference?->parameters ?? [];

        return match ($protocol) {
            VMTemplateProtocol::RDP => $this->buildRDPParams($session->ip_address, $session, $userSettings),
            VMTemplateProtocol::VNC => $this->buildVNCParams($session->ip_address, $session, $userSettings),
            VMTemplateProtocol::SSH => $this->buildSSHParams($session->ip_address, $session, $userSettings),
            default => throw new RuntimeException("Unsupported protocol: {$protocol->value}"),
        };
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
            'hostname'                   => $hostname,
            'port'                       => (string) ($rdpConfig['port'] ?? 3389),
            'username'                   => '',
            'password'                   => '',
            'domain'                     => '',
            'security'                   => $rdpConfig['security'] ?? 'nla',
            'ignore-cert'                => filter_var($rdpConfig['ignore_cert'] ?? true, FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false',
            'resize-method'              => $rdpConfig['resize_method'] ?? 'display-update',
            // Display
            'width'                      => '1280',
            'height'                     => '720',
            'dpi'                        => '96',
            'color-depth'                => '32',
            // Performance — disable heavy visuals for better remote performance
            'disable-wallpaper'          => 'true',
            'disable-theming'            => 'false',
            'enable-font-smoothing'      => 'false',
            'enable-full-window-drag'    => 'false',
            'enable-desktop-composition' => 'false',
            'enable-menu-animations'     => 'false',
            // Device redirection
            'enable-audio'               => 'true',
            'enable-printing'            => 'false',
            'enable-drive'               => 'false',
            'drive-path'                 => '/tmp/guacamole',
            'enable-microphone'          => 'false',
            // Network
            'connection-timeout'         => '10',
        ];

        $merged             = array_merge($defaults, $this->sanitizeUserSettings($userSettings));
        $merged['hostname'] = $hostname; // Always the VM's dynamic IP — never overridable by user

        return [
            'name'       => "session-{$session->id}",
            'protocol'   => 'rdp',
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
            'hostname'           => $hostname,
            'port'               => (string) ($vncConfig['port'] ?? 5900),
            'password'           => '',
            'read-only'          => 'false',
            'width'              => '1280',
            'height'             => '720',
            'dpi'                => '96',
            'color-depth'        => '32',
            'enable-audio'       => 'false',
            'connection-timeout' => '10',
        ];

        $merged             = array_merge($defaults, $this->sanitizeUserSettings($userSettings));
        $merged['hostname'] = $hostname;

        return [
            'name'       => "session-{$session->id}",
            'protocol'   => 'vnc',
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
            'hostname'            => $hostname,
            'port'                => (string) ($sshConfig['port'] ?? 22),
            'username'            => '',
            'password'            => '',
            'private-key'         => '',
            'passphrase'          => '',
            'font-size'           => '12',
            'color-scheme'        => 'gray-black',
            'enable-sftp'         => 'true',
            'sftp-root-directory' => '/home',
            'connection-timeout'  => '10',
        ];

        $merged             = array_merge($defaults, $this->sanitizeUserSettings($userSettings));
        $merged['hostname'] = $hostname;

        return [
            'name'       => "session-{$session->id}",
            'protocol'   => 'ssh',
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
