<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\SearchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class SearchControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private $searchServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->engineer()->create();

        // Mock SearchService
        $this->searchServiceMock = Mockery::mock(SearchService::class);
        $this->app->instance(SearchService::class, $this->searchServiceMock);
    }

    public function test_search_endpoint_returns_json_response(): void
    {
        $searchResult = [
            'results' => collect([]),
            'total' => 0,
        ];

        $categories = [
            ['name' => 'Web Development', 'slug' => 'web-development'],
        ];

        $this->searchServiceMock
            ->shouldReceive('search')
            ->once()
            ->andReturn($searchResult);

        $this->searchServiceMock
            ->shouldReceive('getCategories')
            ->once()
            ->andReturn($categories);

        $response = $this->actingAs($this->user)
            ->getJson('/search?q=laravel');

        $response->assertOk()
            ->assertJsonStructure([
                'results',
                'total',
                'query',
                'filters',
                'sort',
                'categories',
            ]);
    }

    public function test_search_requires_query_parameter(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/search');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['q']);
    }

    public function test_search_validates_query_minimum_length(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/search?q=a');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['q']);
    }

    public function test_search_endpoint_with_filters(): void
    {
        $searchResult = [
            'results' => collect([]),
            'total' => 0,
        ];

        $categories = [];

        $expectedFilters = [
            'category' => 'web-development',
            'level' => 'Beginner',
            'price_min' => 10.0,
            'price_max' => 100.0,
            'is_free' => false,
            'has_virtual_machine' => true,
        ];

        $this->searchServiceMock
            ->shouldReceive('search')
            ->once()
            ->andReturn($searchResult);

        $this->searchServiceMock
            ->shouldReceive('getCategories')
            ->once()
            ->andReturn($categories);

        $response = $this->actingAs($this->user)
            ->getJson('/search?'.http_build_query([
                'q' => 'laravel',
                'category' => 'web-development',
                'level' => 'Beginner',
                'price_min' => 10,
                'price_max' => 100,
                'is_free' => false,
                'has_virtual_machine' => true,
                'sort' => 'newest',
            ]));

        $response->assertOk();
    }

    public function test_suggest_endpoint_returns_suggestions(): void
    {
        $suggestions = ['laravel', 'laravel php', 'laravel tutorial'];

        $this->searchServiceMock
            ->shouldReceive('suggest')
            ->once()
            ->andReturn($suggestions);

        $response = $this->actingAs($this->user)
            ->getJson('/search/suggest?q=lar');

        $response->assertOk()
            ->assertJson([
                'suggestions' => $suggestions,
            ]);
    }

    public function test_suggest_endpoint_with_custom_limit(): void
    {
        $suggestions = ['laravel', 'laravel php'];

        $this->searchServiceMock
            ->shouldReceive('suggest')
            ->once()
            ->andReturn($suggestions);

        $response = $this->actingAs($this->user)
            ->getJson('/search/suggest?q=lar&limit=2');

        $response->assertOk()
            ->assertJson([
                'suggestions' => $suggestions,
            ]);
    }

    public function test_recent_searches_for_authenticated_user(): void
    {
        $recentSearches = collect([
            (object) ['query' => 'laravel'],
            (object) ['query' => 'vue'],
        ]);

        // Use Eloquent collection instead of Support collection
        $eloquentCollection = \Illuminate\Database\Eloquent\Collection::make($recentSearches);

        $this->searchServiceMock
            ->shouldReceive('getRecentSearches')
            ->once()
            ->andReturn($eloquentCollection);

        $response = $this->actingAs($this->user)
            ->getJson('/search/recent');

        $response->assertOk()
            ->assertJson([
                'searches' => ['laravel', 'vue'],
            ]);
    }

    public function test_recent_searches_for_unauthenticated_user(): void
    {
        $response = $this->getJson('/search/recent');

        $response->assertUnauthorized();
    }

    public function test_trending_searches_endpoint(): void
    {
        $trending = ['laravel', 'vue', 'react'];

        $this->searchServiceMock
            ->shouldReceive('getTrendingSearches')
            ->once()
            ->andReturn($trending);

        $response = $this->getJson('/search/trending');

        $response->assertOk()
            ->assertJson([
                'trending' => $trending,
            ]);
    }

    public function test_categories_endpoint(): void
    {
        $categories = [
            ['name' => 'Web Development', 'slug' => 'web-development', 'count' => 15],
            ['name' => 'Data Science', 'slug' => 'data-science', 'count' => 8],
        ];

        $this->searchServiceMock
            ->shouldReceive('getCategories')
            ->once()
            ->andReturn($categories);

        $response = $this->getJson('/search/categories');

        $response->assertOk()
            ->assertJson([
                'categories' => $categories,
            ]);
    }

    public function test_by_category_endpoint_returns_json(): void
    {
        $courses = \Illuminate\Database\Eloquent\Collection::make([]);
        $categories = [
            ['name' => 'Web Development', 'slug' => 'web-development'],
        ];

        $this->searchServiceMock
            ->shouldReceive('getCoursesByCategory')
            ->once()
            ->andReturn($courses);

        $this->searchServiceMock
            ->shouldReceive('getCategories')
            ->once()
            ->andReturn($categories);

        $response = $this->getJson('/search/category/web-development');

        $response->assertOk()
            ->assertJsonStructure([
                'courses',
                'category',
            ])
            ->assertJson([
                'category' => 'Web Development',
            ]);
    }

    public function test_by_category_endpoint_with_unknown_category(): void
    {
        $courses = \Illuminate\Database\Eloquent\Collection::make([]);
        $categories = [];

        $this->searchServiceMock
            ->shouldReceive('getCoursesByCategory')
            ->once()
            ->andReturn($courses);

        $this->searchServiceMock
            ->shouldReceive('getCategories')
            ->once()
            ->andReturn($categories);

        $response = $this->getJson('/search/category/unknown-category');

        $response->assertOk()
            ->assertJson([
                'category' => 'Unknown Category', // Converted from slug
            ]);
    }
}
