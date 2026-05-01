<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_users_can_view_the_home_page()
    {
        $user = User::factory()->admin()->create();

        $response = $this->actingAs($user)->get(route('admin.dashboard'));

        $response->assertOk();
    }

    public function test_engineers_can_view_the_home_page()
    {
        $user = User::factory()->engineer()->create();

        $response = $this->actingAs($user)->get(route('home'));

        $response->assertOk();
    }
}
