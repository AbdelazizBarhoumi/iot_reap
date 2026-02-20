<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Diagnostic test: POST /api/tokens against configured Guacamole server and
 * expose raw status, headers and body for debugging authentication errors.
 *
 * Guarded by GUACAMOLE_LIVE_TEST and existing Guacamole credentials.
 * @group integration
 */
class GuacamoleTokenRawDiagnosticTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (! (bool) getenv('GUACAMOLE_LIVE_TEST')) {
            $this->markTestSkipped('GUACAMOLE_LIVE_TEST not enabled');
        }

        if (!config('guacamole.username') || !config('guacamole.password')) {
            $this->markTestSkipped('Guacamole credentials are not configured');
        }
    }

    public function test_post_tokens_shows_raw_response(): void
    {
        $url = rtrim(config('guacamole.url'), '/') . '/api/tokens';
        $username = config('guacamole.username');
        $password = config('guacamole.password');

        // Guacamole /api/tokens requires urlencoded form body, NOT JSON
        $response = Http::timeout(30)->asForm()->post($url, [
            'username' => $username,
            'password' => $password,
        ]);

        $status = $response->status();
        $body = $response->body();
        $headers = $response->headers();

        $diagnostic = "POST {$url} returned status {$status}\n\nHeaders:\n" . var_export($headers, true) . "\n\nBody:\n" . $body;

        // If not 200, fail and show raw response for debugging
        $this->assertSame(200, $status, $diagnostic);

        $json = $response->json();
        $this->assertArrayHasKey('authToken', $json, "Response JSON does not contain authToken.\n{$diagnostic}");
        $this->assertNotEmpty($json['authToken'], "authToken is empty.\n{$diagnostic}");
    }
}
