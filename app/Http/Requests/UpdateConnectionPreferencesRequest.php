<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates incoming preference settings before saving to the database.
 *
 * Only the session owner may update their preferences (enforced via authorize()).
 * All Guacamole parameter values are validated to be strings, numbers, or booleans.
 */
class UpdateConnectionPreferencesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only the session owner can update preferences for their session.
     */
    public function authorize(): bool
    {
        $session = $this->route('session');

        return $session && $session->user_id === $this->user()->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'parameters'                            => ['required', 'array'],
            // Network
            'parameters.port'                       => ['sometimes', 'integer', 'between:1,65535'],
            'parameters.connection-timeout'         => ['sometimes', 'integer', 'min:1', 'max:300'],
            // Authentication
            'parameters.username'                   => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.password'                   => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.domain'                     => ['sometimes', 'nullable', 'string', 'max:255'],
            'parameters.security'                   => ['sometimes', 'string', Rule::in(['nla', 'tls', 'vmconnect', 'rdp', 'any'])],
            'parameters.private-key'                => ['sometimes', 'nullable', 'string'],
            'parameters.passphrase'                 => ['sometimes', 'nullable', 'string', 'max:255'],
            // Display
            'parameters.width'                      => ['sometimes', 'integer', 'between:640,7680'],
            'parameters.height'                     => ['sometimes', 'integer', 'between:480,4320'],
            'parameters.dpi'                        => ['sometimes', 'integer', 'between:72,384'],
            'parameters.color-depth'                => ['sometimes', 'integer', Rule::in([8, 16, 24, 32])],
            // Performance flags
            'parameters.disable-wallpaper'          => ['sometimes', 'boolean'],
            'parameters.disable-theming'            => ['sometimes', 'boolean'],
            'parameters.enable-font-smoothing'      => ['sometimes', 'boolean'],
            'parameters.enable-full-window-drag'    => ['sometimes', 'boolean'],
            'parameters.enable-desktop-composition' => ['sometimes', 'boolean'],
            'parameters.enable-menu-animations'     => ['sometimes', 'boolean'],
            // Device redirection
            'parameters.enable-audio'               => ['sometimes', 'boolean'],
            'parameters.enable-printing'            => ['sometimes', 'boolean'],
            'parameters.enable-drive'               => ['sometimes', 'boolean'],
            'parameters.enable-microphone'          => ['sometimes', 'boolean'],
            // VNC
            'parameters.read-only'                  => ['sometimes', 'boolean'],
            // SSH
            'parameters.font-size'                  => ['sometimes', 'integer', 'between:6,72'],
            'parameters.color-scheme'               => ['sometimes', 'string', 'max:64'],
            'parameters.enable-sftp'                => ['sometimes', 'boolean'],
            'parameters.sftp-root-directory'        => ['sometimes', 'nullable', 'string', 'max:255'],
            // Advanced
            'parameters.ignore-cert'                => ['sometimes', 'boolean'],
            'parameters.resize-method'              => ['sometimes', 'string', Rule::in(['display-update', 'reconnect'])],
            'parameters.preconnection-id'           => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Custom error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'parameters.required' => 'The parameters object is required.',
            'parameters.array'    => 'Parameters must be an object.',
        ];
    }
}
