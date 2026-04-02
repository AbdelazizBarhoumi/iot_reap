<?php

namespace Tests\Unit\Services;

use App\Repositories\CourseRepository;
use App\Repositories\SearchRepository;
use App\Services\SearchService;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Mockery;

class SearchServiceTest extends BaseTestCase
{
    private SearchService $service;

    private $mockSearchRepository;

    private $mockCourseRepository;

    protected function setUp(): void
    {
        parent::setUp();

        // Disable Vite manifest checks for tests
        $this->withoutVite();

        $this->mockSearchRepository = Mockery::mock(SearchRepository::class);
        $this->mockCourseRepository = Mockery::mock(CourseRepository::class);

        $this->service = new SearchService(
            $this->mockSearchRepository,
            $this->mockCourseRepository
        );

        Cache::flush();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_search_returns_empty_for_short_query(): void
    {
        $result = $this->service->search('a');

        $this->assertEquals(['results' => collect(), 'total' => 0], $result);
    }

    public function test_search_returns_courses_and_logs_search(): void
    {
        // Create mock course objects
        $course = Mockery::mock(\App\Models\Course::class)->shouldIgnoreMissing();
        $course->id = 1;
        $course->title = 'Laravel Course';
        $courses = new \Illuminate\Database\Eloquent\Collection([$course]);

        $this->mockCourseRepository
            ->shouldReceive('searchWithFilters')
            ->once()
            ->with('Laravel', [], 'relevance')
            ->andReturn($courses);

        $this->mockSearchRepository
            ->shouldReceive('create')
            ->once()
            ->with([
                'user_id' => null,
                'query' => 'Laravel',
                'results_count' => 1,
                'ip_address' => '192.168.1.1',
                'user_agent' => 'Mozilla/5.0',
            ]);

        Log::shouldReceive('info')
            ->once()
            ->with('Search performed', [
                'query' => 'Laravel',
                'filters' => [],
                'results_count' => 1,
                'user_id' => null,
            ]);

        $result = $this->service->search(
            'Laravel',
            [],
            'relevance',
            null,
            '192.168.1.1',
            'Mozilla/5.0'
        );

        $this->assertEquals([
            'results' => $courses,
            'total' => 1,
        ], $result);
    }

    public function test_search_with_filters(): void
    {
        $course = Mockery::mock(\App\Models\Course::class)->shouldIgnoreMissing();
        $course->id = 1;
        $courses = new \Illuminate\Database\Eloquent\Collection([$course]);
        $filters = ['category' => 'programming', 'level' => 'beginner'];

        $this->mockCourseRepository
            ->shouldReceive('searchWithFilters')
            ->once()
            ->with('React', $filters, 'popularity')
            ->andReturn($courses);

        $this->mockSearchRepository
            ->shouldReceive('create')
            ->once()
            ->with([
                'user_id' => null,
                'query' => 'React',
                'results_count' => 1,
                'ip_address' => null,
                'user_agent' => null,
            ]);

        Log::shouldReceive('info')->once();

        $result = $this->service->search('React', $filters, 'popularity');

        $this->assertCount(1, $result['results']);
        $this->assertEquals(1, $result['total']);
    }

    public function test_suggest_returns_empty_for_short_query(): void
    {
        $result = $this->service->suggest('a');

        $this->assertEquals([], $result);
    }

    public function test_suggest_returns_cached_suggestions(): void
    {
        $suggestions = ['Laravel Basics', 'Laravel Advanced'];

        $this->mockCourseRepository
            ->shouldReceive('getTitleSuggestions')
            ->once()
            ->with('Laravel', 5)
            ->andReturn($suggestions);

        $result = $this->service->suggest('Laravel');

        $this->assertEquals($suggestions, $result);

        // Second call should use cache
        $result2 = $this->service->suggest('Laravel');
        $this->assertEquals($suggestions, $result2);
    }

    public function test_suggest_with_custom_limit(): void
    {
        $suggestions = ['React Hooks', 'React Router', 'React Testing'];

        $this->mockCourseRepository
            ->shouldReceive('getTitleSuggestions')
            ->once()
            ->with('React', 3)
            ->andReturn($suggestions);

        $result = $this->service->suggest('React', 3);

        $this->assertEquals($suggestions, $result);
    }

    public function test_get_recent_searches(): void
    {
        $user = Mockery::mock(\App\Models\User::class)->makePartial();
        $user->id = 123;
        
        $search1 = Mockery::mock()->shouldIgnoreMissing();
        $search1->query = 'Laravel';
        $search2 = Mockery::mock()->shouldIgnoreMissing();
        $search2->query = 'React';
        $searches = new \Illuminate\Database\Eloquent\Collection([$search1, $search2]);

        $this->mockSearchRepository
            ->shouldReceive('getRecentByUser')
            ->once()
            ->with(123, 5)
            ->andReturn($searches);

        $result = $this->service->getRecentSearches($user);

        $this->assertEquals($searches, $result);
    }

    public function test_get_recent_searches_with_custom_limit(): void
    {
        $user = Mockery::mock(\App\Models\User::class)->makePartial();
        $user->id = 123;
        
        $search = Mockery::mock()->shouldIgnoreMissing();
        $search->query = 'Vue';
        $searches = new \Illuminate\Database\Eloquent\Collection([$search]);

        $this->mockSearchRepository
            ->shouldReceive('getRecentByUser')
            ->once()
            ->with(123, 3)
            ->andReturn($searches);

        $result = $this->service->getRecentSearches($user, 3);

        $this->assertEquals($searches, $result);
    }

    public function test_get_trending_searches(): void
    {
        $trending1 = Mockery::mock()->shouldIgnoreMissing();
        $trending1->query = 'Laravel';
        $trending2 = Mockery::mock()->shouldIgnoreMissing();
        $trending2->query = 'React';
        $trending = new \Illuminate\Database\Eloquent\Collection([$trending1, $trending2]);

        $this->mockSearchRepository
            ->shouldReceive('getTrending')
            ->once()
            ->with(7, 5)
            ->andReturn($trending);

        $result = $this->service->getTrendingSearches();

        $this->assertEquals(['Laravel', 'React'], $result);
    }

    public function test_get_trending_searches_with_custom_params(): void
    {
        $trending1 = Mockery::mock()->shouldIgnoreMissing();
        $trending1->query = 'Vue';
        $trending = new \Illuminate\Database\Eloquent\Collection([$trending1]);

        $this->mockSearchRepository
            ->shouldReceive('getTrending')
            ->once()
            ->with(14, 3)
            ->andReturn($trending);

        $result = $this->service->getTrendingSearches(14, 3);

        $this->assertEquals(['Vue'], $result);
    }

    public function test_get_categories(): void
    {
        $categories = [
            ['slug' => 'web-dev', 'name' => 'Web Development', 'count' => 10],
            ['slug' => 'data-science', 'name' => 'Data Science', 'count' => 5],
        ];

        $this->mockCourseRepository
            ->shouldReceive('getCategoryStats')
            ->once()
            ->andReturn($categories);

        $result = $this->service->getCategories();

        $this->assertEquals($categories, $result);

        // Second call should use cache
        $result2 = $this->service->getCategories();
        $this->assertEquals($categories, $result2);
    }

    public function test_get_courses_by_category(): void
    {
        $course1 = Mockery::mock(\App\Models\Course::class)->shouldIgnoreMissing();
        $course1->title = 'Laravel Course';
        $course2 = Mockery::mock(\App\Models\Course::class)->shouldIgnoreMissing();
        $course2->title = 'PHP Course';
        $courses = new \Illuminate\Database\Eloquent\Collection([$course1, $course2]);

        $this->mockCourseRepository
            ->shouldReceive('findByCategorySlug')
            ->once()
            ->with('web-development')
            ->andReturn($courses);

        $result = $this->service->getCoursesByCategory('web-development');

        $this->assertEquals($courses, $result);
    }
}
