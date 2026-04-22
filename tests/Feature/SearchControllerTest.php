<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\SearchService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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
            ['name' => 'Smart Manufacturing', 'slug' => 'smart-manufacturing'],
        ];

        $this->searchServiceMock
            ->shouldReceive('search')
            ->once()
            ->andReturnUsing(fn () => $searchResult);

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

    public function test_search_page_renders_inertia_response_for_browser_requests(): void
    {
        $searchResult = [
            'results' => collect([]),
            'total' => 0,
        ];

        $categories = [
            ['name' => 'Smart Manufacturing', 'slug' => 'smart-manufacturing'],
        ];

        $this->searchServiceMock
            ->shouldReceive('search')
            ->once()
            ->andReturnUsing(fn () => $searchResult);

        $this->searchServiceMock
            ->shouldReceive('getCategories')
            ->once()
            ->andReturn($categories);

        $this->get('/search?q=laravel')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('trainingPaths/search')
                ->where('query', 'laravel')
                ->where('total', 0)
                ->has('results', 0)
                ->has('trainingPaths', 0)
                ->has('categories', 1)
            );
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
            'category' => 'smart-manufacturing',
            'level' => 'Beginner',
            'price_min' => 10.0,
            'price_max' => 100.0,
            'is_free' => false,
            'has_virtual_machine' => true,
        ];

        $this->searchServiceMock
            ->shouldReceive('search')
            ->once()
            ->andReturnUsing(fn () => $searchResult);

        $this->searchServiceMock
            ->shouldReceive('getCategories')
            ->once()
            ->andReturn($categories);

        $response = $this->actingAs($this->user)
            ->getJson('/search?'.http_build_query([
                'q' => 'laravel',
                'category' => 'smart-manufacturing',
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
            ->andReturnUsing(fn () => $suggestions);

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
            ->andReturnUsing(fn () => $suggestions);

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
        $eloquentCollection = Collection::make($recentSearches);

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
            ->andReturnUsing(fn () => $trending);

        $response = $this->getJson('/search/trending');

        $response->assertOk()
            ->assertJson([
                'trending' => $trending,
            ]);
    }

    public function test_categories_endpoint(): void
    {
        $categories = [
            ['name' => 'Smart Manufacturing', 'slug' => 'smart-manufacturing', 'count' => 15],
            ['name' => 'Predictive Maintenance', 'slug' => 'predictive-maintenance', 'count' => 8],
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
        $trainingPaths = Collection::make([]);
        $categories = [
            ['name' => 'Smart Manufacturing', 'slug' => 'smart-manufacturing'],
        ];

        $this->searchServiceMock
            ->shouldReceive('getTrainingPathsByCategory')
            ->once()
            ->andReturn($trainingPaths);

        $this->searchServiceMock
            ->shouldReceive('getCategories')
            ->once()
            ->andReturn($categories);

        $response = $this->getJson('/search/category/smart-manufacturing');

        $response->assertOk()
            ->assertJsonStructure([
                'trainingPaths',
                'category',
            ])
            ->assertJson([
                'category' => 'Smart Manufacturing',
            ]);
    }

    public function test_by_category_page_renders_inertia_response_for_browser_requests(): void
    {
        $trainingPaths = Collection::make([]);
        $categories = [
            ['name' => 'Smart Manufacturing', 'slug' => 'smart-manufacturing', 'count' => 0],
        ];

        $this->searchServiceMock
            ->shouldReceive('getTrainingPathsByCategory')
            ->once()
            ->andReturn($trainingPaths);

        $this->searchServiceMock
            ->shouldReceive('getCategories')
            ->once()
            ->andReturn($categories);

        $this->get('/search/category/smart-manufacturing')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('trainingPaths/category')
                ->where('category', 'Smart Manufacturing')
                ->where('slug', 'smart-manufacturing')
                ->where('total', 0)
                ->has('trainingPaths', 0)
                ->has('categories', 1)
            );
    }

    public function test_by_category_endpoint_with_unknown_category(): void
    {
        $trainingPaths = Collection::make([]);
        $categories = [];

        $this->searchServiceMock
            ->shouldReceive('getTrainingPathsByCategory')
            ->once()
            ->andReturn($trainingPaths);

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
