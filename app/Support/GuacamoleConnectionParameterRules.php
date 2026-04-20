<?php

namespace App\Support;

use Illuminate\Validation\Rule;

final class GuacamoleConnectionParameterRules
{
    /**
     * Shared validation rules for Guacamole connection `parameters.*` fields.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        return [
            // Common / hostname
            'parameters.hostname' => ['sometimes', 'nullable', 'string', 'max:255'],

            // Concurrency Limits
            'parameters.max-connections' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'parameters.max-connections-per-user' => ['sometimes', 'nullable', 'integer', 'min:0'],

            // Load Balancing
            'parameters.weight' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'parameters.failover-only' => ['sometimes', 'nullable', 'boolean'],

            // Guacamole Proxy (guacd)
            'parameters.guacd-hostname' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.guacd-port' => ['sometimes', 'nullable', 'integer', 'between:1,65535'],
            'parameters.guacd-encryption' => ['sometimes', 'nullable', 'string', Rule::in(['none', 'ssl', 'tls'])],

            // Network
            'parameters.port' => ['sometimes', 'integer', 'between:1,65535'],
            'parameters.timeout' => ['sometimes', 'integer', 'min:1', 'max:300'],

            // Authentication
            'parameters.username' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.password' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.domain' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.security' => ['sometimes', 'string', Rule::in(['nla', 'tls', 'vmconnect', 'rdp', 'any'])],
            'parameters.disable-auth' => ['sometimes', 'boolean'],
            'parameters.ignore-cert' => ['sometimes', 'boolean'],
            'parameters.cert-tofu' => ['sometimes', 'boolean'],
            'parameters.cert-fingerprints' => ['sometimes', 'nullable', 'string'],

            // Remote Desktop Gateway
            'parameters.gateway-hostname' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.gateway-port' => ['sometimes', 'nullable', 'integer', 'between:1,65535'],
            'parameters.gateway-username' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.gateway-password' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.gateway-domain' => ['sometimes', 'nullable', 'string', 'max:255'],

            // Display
            'parameters.width' => ['sometimes', 'integer', 'between:640,7680'],
            'parameters.height' => ['sometimes', 'integer', 'between:480,4320'],
            'parameters.dpi' => ['sometimes', 'integer', 'between:72,384'],
            'parameters.color-depth' => ['sometimes', 'integer', Rule::in([8, 16, 24, 32])],
            'parameters.force-lossless' => ['sometimes', 'boolean'],
            'parameters.resize-method' => ['sometimes', 'string', Rule::in(['display-update', 'reconnect'])],
            'parameters.read-only' => ['sometimes', 'boolean'],
            'parameters.disable-server-input' => ['sometimes', 'boolean'],
            'parameters.disable-display-resize' => ['sometimes', 'boolean'],
            'parameters.swap-red-blue' => ['sometimes', 'boolean'],
            'parameters.cursor' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.encodings' => ['sometimes', 'nullable', 'string'],
            'parameters.compress-level' => ['sometimes', 'nullable', 'integer', 'between:0,9'],
            'parameters.quality-level' => ['sometimes', 'nullable', 'integer', 'between:0,9'],
            'parameters.font-name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.scrollback' => ['sometimes', 'nullable', 'integer', 'min:0'],

            // Clipboard
            'parameters.normalize-clipboard' => ['sometimes', 'nullable', 'string', Rule::in(['preserve', 'unix', 'windows'])],
            'parameters.clipboard-encoding' => ['sometimes', 'nullable', 'string', 'max:100'],
            'parameters.disable-copy' => ['sometimes', 'boolean'],
            'parameters.disable-paste' => ['sometimes', 'boolean'],

            // Device Redirection
            'parameters.disable-audio' => ['sometimes', 'boolean'],
            'parameters.console-audio' => ['sometimes', 'boolean'],
            'parameters.enable-audio-input' => ['sometimes', 'boolean'],
            'parameters.enable-touch' => ['sometimes', 'boolean'],
            'parameters.enable-audio' => ['sometimes', 'boolean'],
            'parameters.audio-servername' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.enable-printing' => ['sometimes', 'boolean'],
            'parameters.printer-name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.enable-drive' => ['sometimes', 'boolean'],
            'parameters.drive-name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.drive-path' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.create-drive-path' => ['sometimes', 'boolean'],
            'parameters.disable-download' => ['sometimes', 'boolean'],
            'parameters.disable-upload' => ['sometimes', 'boolean'],
            'parameters.static-channels' => ['sometimes', 'nullable', 'string'],

            // Performance
            'parameters.disable-wallpaper' => ['sometimes', 'boolean'],
            'parameters.enable-wallpaper' => ['sometimes', 'boolean'],
            'parameters.disable-theming' => ['sometimes', 'boolean'],
            'parameters.enable-theming' => ['sometimes', 'boolean'],
            'parameters.enable-font-smoothing' => ['sometimes', 'boolean'],
            'parameters.enable-full-window-drag' => ['sometimes', 'boolean'],
            'parameters.enable-desktop-composition' => ['sometimes', 'boolean'],
            'parameters.enable-menu-animations' => ['sometimes', 'boolean'],
            'parameters.disable-bitmap-caching' => ['sometimes', 'boolean'],
            'parameters.disable-offscreen-caching' => ['sometimes', 'boolean'],
            'parameters.disable-glyph-caching' => ['sometimes', 'boolean'],
            'parameters.disable-gfx' => ['sometimes', 'boolean'],

            // Basic Settings
            'parameters.initial-program' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.client-name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.server-layout' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.timezone' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.console' => ['sometimes', 'boolean'],
            'parameters.command' => ['sometimes', 'nullable', 'string'],
            'parameters.locale' => ['sometimes', 'nullable', 'string', 'max:255'],

            // Recording
            'parameters.recording-path' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.recording-name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.recording-exclude-output' => ['sometimes', 'boolean'],
            'parameters.recording-exclude-mouse' => ['sometimes', 'boolean'],
            'parameters.recording-include-keys' => ['sometimes', 'boolean'],
            'parameters.create-recording-path' => ['sometimes', 'boolean'],

            // SFTP
            'parameters.enable-sftp' => ['sometimes', 'boolean'],
            'parameters.sftp-hostname' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.sftp-port' => ['sometimes', 'nullable', 'integer', 'between:1,65535'],
            'parameters.sftp-timeout' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'parameters.sftp-host-key' => ['sometimes', 'nullable', 'string'],
            'parameters.sftp-username' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.sftp-password' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.sftp-private-key' => ['sometimes', 'nullable', 'string'],
            'parameters.sftp-passphrase' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.sftp-root-directory' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.sftp-directory' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.sftp-server-alive-interval' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'parameters.sftp-disable-download' => ['sometimes', 'boolean'],
            'parameters.sftp-disable-upload' => ['sometimes', 'boolean'],

            // RemoteApp
            'parameters.remote-app' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.remote-app-dir' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.remote-app-args' => ['sometimes', 'nullable', 'string', 'max:255'],

            // Preconnection / Hyper-V
            'parameters.preconnection-blob' => ['sometimes', 'nullable', 'string'],
            'parameters.preconnection-id' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.load-balance-info' => ['sometimes', 'nullable', 'string', 'max:255'],

            // Wake-on-LAN
            'parameters.wol-send-packet' => ['sometimes', 'boolean'],
            'parameters.wol-mac-addr' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.wol-broadcast-addr' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.wol-udp-port' => ['sometimes', 'nullable', 'integer', 'between:1,65535'],
            'parameters.wol-wait-time' => ['sometimes', 'nullable', 'integer', 'min:0'],

            // SSH/common terminal & key auth
            'parameters.public-key' => ['sometimes', 'nullable', 'string'],
            'parameters.host-key' => ['sometimes', 'nullable', 'string'],
            'parameters.server-alive-interval' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'parameters.font-size' => ['sometimes', 'integer', 'between:6,72'],
            'parameters.color-scheme' => ['sometimes', 'string', 'max:64'],
            'parameters.private-key' => ['sometimes', 'nullable', 'string'],
            'parameters.passphrase' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.backspace' => ['sometimes', 'nullable', 'string', 'max:50'],
            'parameters.terminal-type' => ['sometimes', 'nullable', 'string', 'max:50'],

            // VNC repeater / reverse connection
            'parameters.dest-host' => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.dest-port' => ['sometimes', 'nullable', 'integer', 'between:1,65535'],
            'parameters.reverse-connect' => ['sometimes', 'boolean'],
            'parameters.listen-timeout' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'parameters.autoretry' => ['sometimes', 'nullable', 'string', 'max:50'],
        ];
    }

    /**
     * Canonical parameter keys allowed per protocol.
     *
     * @return array<int, string>
     */
    public static function allowedKeysForProtocol(string $protocol): array
    {
        $protocol = strtolower($protocol);

        $attributes = [
            'max-connections',
            'max-connections-per-user',
            'weight',
            'failover-only',
            'guacd-hostname',
            'guacd-port',
            'guacd-encryption',
        ];

        $commonClipboard = ['disable-copy', 'disable-paste'];

        $commonSftp = [
            'enable-sftp',
            'sftp-hostname',
            'sftp-port',
            'sftp-timeout',
            'sftp-host-key',
            'sftp-username',
            'sftp-password',
            'sftp-private-key',
            'sftp-passphrase',
            'sftp-directory',
            'sftp-root-directory',
            'sftp-server-alive-interval',
            'sftp-disable-download',
            'sftp-disable-upload',
        ];

        $commonRecording = [
            'recording-path',
            'create-recording-path',
            'recording-name',
            'recording-exclude-output',
            'recording-exclude-mouse',
            'recording-include-keys',
        ];

        $commonWake = [
            'wol-send-packet',
            'wol-mac-addr',
            'wol-broadcast-addr',
            'wol-udp-port',
            'wol-wait-time',
        ];

        $rdp = [
            'hostname',
            'port',
            'timeout',
            'username',
            'password',
            'domain',
            'security',
            'ignore-cert',
            'cert-tofu',
            'cert-fingerprints',
            'disable-auth',
            'normalize-clipboard',
            'client-name',
            'console',
            'initial-program',
            'server-layout',
            'timezone',
            'color-depth',
            'width',
            'height',
            'dpi',
            'resize-method',
            'force-lossless',
            'disable-audio',
            'enable-audio-input',
            'enable-touch',
            'console-audio',
            'enable-printing',
            'printer-name',
            'enable-drive',
            'disable-download',
            'disable-upload',
            'drive-name',
            'drive-path',
            'create-drive-path',
            'static-channels',
            'preconnection-id',
            'preconnection-blob',
            'gateway-hostname',
            'gateway-port',
            'gateway-username',
            'gateway-password',
            'gateway-domain',
            'load-balance-info',
            'enable-wallpaper',
            'enable-theming',
            'enable-font-smoothing',
            'enable-full-window-drag',
            'enable-desktop-composition',
            'enable-menu-animations',
            'disable-bitmap-caching',
            'disable-offscreen-caching',
            'disable-glyph-caching',
            'disable-gfx',
            'remote-app',
            'remote-app-dir',
            'remote-app-args',
        ];

        $vnc = [
            'hostname',
            'port',
            'autoretry',
            'username',
            'password',
            'color-depth',
            'disable-server-input',
            'disable-display-resize',
            'swap-red-blue',
            'cursor',
            'encodings',
            'read-only',
            'force-lossless',
            'compress-level',
            'quality-level',
            'dest-host',
            'dest-port',
            'reverse-connect',
            'listen-timeout',
            'enable-audio',
            'audio-servername',
            'clipboard-encoding',
            'timeout',
        ];

        $ssh = [
            'hostname',
            'port',
            'timeout',
            'host-key',
            'server-alive-interval',
            'username',
            'password',
            'private-key',
            'passphrase',
            'public-key',
            'command',
            'locale',
            'timezone',
            'color-scheme',
            'font-size',
            'backspace',
            'terminal-type',
        ];

        return match ($protocol) {
            'rdp' => array_values(array_unique(array_merge($attributes, $rdp, $commonClipboard, $commonSftp, $commonRecording, $commonWake))),
            'vnc' => array_values(array_unique(array_merge($attributes, $vnc, $commonClipboard, $commonSftp, $commonRecording, $commonWake))),
            'ssh' => array_values(array_unique(array_merge($attributes, $ssh, $commonClipboard, $commonSftp, $commonRecording, $commonWake))),
            default => [],
        };
    }

    /**
     * Return unsupported keys for the given protocol.
     *
     * @param  array<string, mixed>  $parameters
     * @return array<int, string>
     */
    public static function unknownKeysForProtocol(array $parameters, string $protocol): array
    {
        $allowed = self::allowedKeysForProtocol($protocol);

        if ($allowed === []) {
            return array_keys($parameters);
        }

        return array_values(array_diff(array_keys($parameters), $allowed));
    }
}
