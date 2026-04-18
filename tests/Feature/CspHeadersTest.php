<?php

namespace Tests\Feature;

use App\Http\Middleware\SecurityHeaders;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class CspHeadersTest extends TestCase
{
    public function test_csp_allows_youtube_embeds_in_frame_src(): void
    {
        Route::get('/csp-test', fn () => response('ok'))->middleware(SecurityHeaders::class);

        $response = $this->get('/csp-test');

        $response->assertStatus(200);
        $response->assertHeaderContains(
            'Content-Security-Policy',
            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com"
        );
    }
}
