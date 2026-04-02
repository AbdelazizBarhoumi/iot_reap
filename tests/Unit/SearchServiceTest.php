<?php

namespace Tests\Unit;

use App\Enums\CourseLevel;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Search;
use App\Models\User;
use App\Services\SearchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class SearchServiceTest extends TestCase
{

    private SearchService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(SearchService::class);
        Cache::flush();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // search() method tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_searches_courses_by_title(): void
    {
        Course::factory()->approved()->create(['title' => 'Laravel for Beginners']);
        Course::factory()->approved()->create(['title' => 'React Masterclass']);

        $result = $this->service->search('Laravel', [], 'relevance');

        $this->assertCount(1, $result['results']);
        $this->assertEquals('Laravel for Beginners', $result['results']->first()->title);
    }

    public function test_searches_courses_by_description(): void
    {
        Course::factory()->approved()->create([
            'title' => 'Web Development',
            'description' => 'Learn advanced Laravel techniques and best practices',
        ]);
        Course::factory()->approved()->create([
            'title' => 'Mobile Apps',
            'description' => 'Build iOS and Android applications',
        ]);

        $result = $this->service->search('Laravel', [], 'relevance');

        $this->assertCount(1, $result['results']);
        $this->assertStringContainsString('Laravel', $result['results']->first()->description);
    }

    public function test_returns_empty_for_short_queries(): void
    {
        Course::factory()->approved()->create(['title' => 'A Course']);

        $result = $this->service->search('A', [], 'relevance');

        $this->assertCount(0, $result['results']);
        $this->assertEquals(0, $result['total']);
    }

    public function test_trims_whitespace_from_query(): void
    {
        Course::factory()->approved()->create(['title' => 'Laravel Basics']);

        $result = $this->service->search('   Laravel   ', [], 'relevance');

        $this->assertCount(1, $result['results']);
    }

    public function test_excludes_draft_courses(): void
    {
        Course::factory()->create(['title' => 'Draft Laravel Course']); // Default status is DRAFT
        Course::factory()->approved()->create(['title' => 'Published Laravel Course']);

        $result = $this->service->search('Laravel', [], 'relevance');

        $this->assertCount(1, $result['results']);
        $this->assertEquals('Published Laravel Course', $result['results']->first()->title);
    }

    public function test_excludes_pending_review_courses(): void
    {
        Course::factory()->pendingReview()->create(['title' => 'Pending Laravel Course']);
        Course::factory()->approved()->create(['title' => 'Approved Laravel Course']);

        $result = $this->service->search('Laravel', [], 'relevance');

        $this->assertCount(1, $result['results']);
        $this->assertEquals('Approved Laravel Course', $result['results']->first()->title);
    }

    public function test_excludes_rejected_courses(): void
    {
        Course::factory()->rejected()->create(['title' => 'Rejected Laravel Course']);
        Course::factory()->approved()->create(['title' => 'Good Laravel Course']);

        $result = $this->service->search('Laravel', [], 'relevance');

        $this->assertCount(1, $result['results']);
        $this->assertEquals('Good Laravel Course', $result['results']->first()->title);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Filter tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_filters_by_category(): void
    {
        Course::factory()->approved()->create([
            'title' => 'Laravel Web Development',
            'category' => 'Web Development',
        ]);
        Course::factory()->approved()->create([
            'title' => 'Laravel for Data Science',
            'category' => 'Data Science',
        ]);

        $result = $this->service->search('Laravel', ['category' => 'Web Development'], 'relevance');

        $this->assertCount(1, $result['results']);
        $this->assertEquals('Web Development', $result['results']->first()->category);
    }

    public function test_filters_by_level(): void
    {
        Course::factory()->approved()->create([
            'title' => 'Laravel Fundamentals',
            'level' => CourseLevel::BEGINNER,
        ]);
        Course::factory()->approved()->create([
            'title' => 'Laravel Advanced Patterns',
            'level' => CourseLevel::ADVANCED,
        ]);

        $result = $this->service->search('Laravel', ['level' => CourseLevel::BEGINNER], 'relevance');

        $this->assertCount(1, $result['results']);
        $this->assertEquals(CourseLevel::BEGINNER, $result['results']->first()->level);
    }

    public function test_filters_by_price_range(): void
    {
        Course::factory()->approved()->create([
            'title' => 'Budget Laravel Course',
            'price_cents' => 1999, // $19.99
            'is_free' => false,
        ]);
        Course::factory()->approved()->create([
            'title' => 'Premium Laravel Course',
            'price_cents' => 9999, // $99.99
            'is_free' => false,
        ]);

        $result = $this->service->search('Laravel', [
            'price_min' => 10,
            'price_max' => 50,
        ], 'relevance');

        $this->assertCount(1, $result['results']);
        $this->assertEquals('Budget Laravel Course', $result['results']->first()->title);
    }

    public function test_filters_by_free_courses(): void
    {
        Course::factory()->approved()->create([
            'title' => 'Free Laravel Tutorial',
            'is_free' => true,
            'price_cents' => 0,
        ]);
        Course::factory()->approved()->create([
            'title' => 'Paid Laravel Course',
            'is_free' => false,
            'price_cents' => 4999,
        ]);

        $result = $this->service->search('Laravel', ['is_free' => true], 'relevance');

        $this->assertCount(1, $result['results']);
        $this->assertTrue($result['results']->first()->is_free);
    }

    public function test_filters_by_has_virtual_machine(): void
    {
        Course::factory()->approved()->withVirtualMachine()->create([
            'title' => 'Laravel with VM Labs',
        ]);
        Course::factory()->approved()->create([
            'title' => 'Laravel Theory Only',
            'has_virtual_machine' => false,
        ]);

        $result = $this->service->search('Laravel', ['has_virtual_machine' => true], 'relevance');

        $this->assertCount(1, $result['results']);
        $this->assertTrue($result['results']->first()->has_virtual_machine);
    }

    public function test_applies_multiple_filters(): void
    {
        Course::factory()->approved()->create([
            'title' => 'Beginner Web Laravel',
            'category' => 'Web Development',
            'level' => CourseLevel::BEGINNER,
        ]);
        Course::factory()->approved()->create([
            'title' => 'Advanced Web Laravel',
            'category' => 'Web Development',
            'level' => CourseLevel::ADVANCED,
        ]);
        Course::factory()->approved()->create([
            'title' => 'Beginner Data Laravel',
            'category' => 'Data Science',
            'level' => CourseLevel::BEGINNER,
        ]);

        $result = $this->service->search('Laravel', [
            'category' => 'Web Development',
            'level' => CourseLevel::BEGINNER,
        ], 'relevance');

        $this->assertCount(1, $result['results']);
        $this->assertEquals('Beginner Web Laravel', $result['results']->first()->title);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Sorting tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_sorts_by_newest(): void
    {
        $oldCourse = Course::factory()->approved()->create([
            'title' => 'Old Laravel Course',
            'created_at' => now()->subDays(30),
        ]);
        $newCourse = Course::factory()->approved()->create([
            'title' => 'New Laravel Course',
            'created_at' => now(),
        ]);

        $result = $this->service->search('Laravel', [], 'newest');

        $this->assertCount(2, $result['results']);
        $this->assertEquals('New Laravel Course', $result['results']->first()->title);
    }

    public function test_sorts_by_rating(): void
    {
        Course::factory()->approved()->create([
            'title' => 'Low Rated Laravel',
            'rating' => 3.5,
        ]);
        Course::factory()->approved()->create([
            'title' => 'Top Rated Laravel',
            'rating' => 4.9,
        ]);

        $result = $this->service->search('Laravel', [], 'rating');

        $this->assertCount(2, $result['results']);
        $this->assertEquals('Top Rated Laravel', $result['results']->first()->title);
    }

    public function test_sorts_by_enrollments(): void
    {
        $popularCourse = Course::factory()->approved()->create([
            'title' => 'Popular Laravel Course',
        ]);
        $unpopularCourse = Course::factory()->approved()->create([
            'title' => 'Unpopular Laravel Course',
        ]);

        // Create enrollments for popular course
        CourseEnrollment::factory()->count(10)->create(['course_id' => $popularCourse->id]);
        CourseEnrollment::factory()->count(2)->create(['course_id' => $unpopularCourse->id]);

        $result = $this->service->search('Laravel', [], 'enrollments');

        $this->assertCount(2, $result['results']);
        $this->assertEquals('Popular Laravel Course', $result['results']->first()->title);
    }

    public function test_sorts_by_price_low_to_high(): void
    {
        Course::factory()->approved()->create([
            'title' => 'Expensive Laravel',
            'price_cents' => 9999,
        ]);
        Course::factory()->approved()->create([
            'title' => 'Cheap Laravel',
            'price_cents' => 999,
        ]);

        $result = $this->service->search('Laravel', [], 'price_low');

        $this->assertCount(2, $result['results']);
        $this->assertEquals('Cheap Laravel', $result['results']->first()->title);
    }

    public function test_sorts_by_price_high_to_low(): void
    {
        Course::factory()->approved()->create([
            'title' => 'Expensive Laravel',
            'price_cents' => 9999,
        ]);
        Course::factory()->approved()->create([
            'title' => 'Cheap Laravel',
            'price_cents' => 999,
        ]);

        $result = $this->service->search('Laravel', [], 'price_high');

        $this->assertCount(2, $result['results']);
        $this->assertEquals('Expensive Laravel', $result['results']->first()->title);
    }

    public function test_defaults_to_relevance_sort_for_unknown(): void
    {
        Course::factory()->approved()->create(['title' => 'Laravel Course']);

        // Should not throw with unknown sort value
        $result = $this->service->search('Laravel', [], 'invalid_sort');

        $this->assertCount(1, $result['results']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Search logging tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_logs_search_query(): void
    {
        Course::factory()->approved()->create(['title' => 'Laravel Course']);

        $this->service->search('Laravel', [], 'relevance');

        $this->assertDatabaseHas('searches', [
            'query' => 'Laravel',
            'results_count' => 1,
        ]);
    }

    public function test_logs_search_with_user_info(): void
    {
        $user = User::factory()->create();
        Course::factory()->approved()->create(['title' => 'Laravel Course']);

        $this->service->search(
            query: 'Laravel',
            filters: [],
            sort: 'relevance',
            user: $user,
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
        );

        $this->assertDatabaseHas('searches', [
            'query' => 'Laravel',
            'user_id' => $user->id,
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0',
        ]);
    }

    public function test_logs_search_without_user(): void
    {
        Course::factory()->approved()->create(['title' => 'Laravel Course']);

        $this->service->search(
            query: 'Laravel',
            filters: [],
            sort: 'relevance',
            user: null,
            ipAddress: '10.0.0.1',
        );

        $this->assertDatabaseHas('searches', [
            'query' => 'Laravel',
            'user_id' => null,
            'ip_address' => '10.0.0.1',
        ]);
    }

    public function test_truncates_long_user_agent(): void
    {
        $longUserAgent = str_repeat('A', 600);
        Course::factory()->approved()->create(['title' => 'Laravel Course']);

        $this->service->search(
            query: 'Laravel',
            filters: [],
            sort: 'relevance',
            user: null,
            ipAddress: null,
            userAgent: $longUserAgent,
        );

        $search = Search::first();
        $this->assertEquals(500, strlen($search->user_agent));
    }

    public function test_does_not_log_short_queries(): void
    {
        $this->service->search('A', [], 'relevance');

        $this->assertDatabaseCount('searches', 0);
    }

    public function test_logs_to_info_channel(): void
    {
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Search performed'
                    && $context['query'] === 'Laravel'
                    && array_key_exists('results_count', $context);
            });

        Course::factory()->approved()->create(['title' => 'Laravel Course']);

        $this->service->search('Laravel', [], 'relevance');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // suggest() method tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_suggests_matching_titles(): void
    {
        Course::factory()->approved()->create(['title' => 'Laravel Basics']);
        Course::factory()->approved()->create(['title' => 'Laravel Advanced']);
        Course::factory()->approved()->create(['title' => 'React Fundamentals']);

        Cache::flush();
        $suggestions = $this->service->suggest('Laravel');

        $this->assertCount(2, $suggestions);
        $this->assertContains('Laravel Basics', $suggestions);
        $this->assertContains('Laravel Advanced', $suggestions);
    }

    public function test_suggest_returns_empty_for_short_query(): void
    {
        Course::factory()->approved()->create(['title' => 'A Course']);

        $suggestions = $this->service->suggest('A');

        $this->assertEmpty($suggestions);
    }

    public function test_suggest_limits_results(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            Course::factory()->approved()->create(['title' => "Laravel Course $i"]);
        }

        Cache::flush();
        $suggestions = $this->service->suggest('Laravel', 3);

        $this->assertCount(3, $suggestions);
    }

    public function test_suggest_only_includes_approved_courses(): void
    {
        Course::factory()->create(['title' => 'Draft Laravel']); // DRAFT
        Course::factory()->pendingReview()->create(['title' => 'Pending Laravel']);
        Course::factory()->approved()->create(['title' => 'Approved Laravel']);

        Cache::flush();
        $suggestions = $this->service->suggest('Laravel');

        $this->assertCount(1, $suggestions);
        $this->assertContains('Approved Laravel', $suggestions);
    }

    public function test_suggest_caches_results(): void
    {
        Course::factory()->approved()->create(['title' => 'Laravel Course']);

        Cache::flush();
        $first = $this->service->suggest('Laravel');

        // Add another course (should not appear due to cache)
        Course::factory()->approved()->create(['title' => 'Laravel Second Course']);

        $second = $this->service->suggest('Laravel');

        $this->assertEquals($first, $second);
    }

    public function test_suggest_trims_query_whitespace(): void
    {
        Course::factory()->approved()->create(['title' => 'Laravel Course']);

        Cache::flush();
        $suggestions = $this->service->suggest('   Laravel   ');

        $this->assertCount(1, $suggestions);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getRecentSearches() method tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_recent_searches_for_user(): void
    {
        $user = User::factory()->create();

        Search::create(['user_id' => $user->id, 'query' => 'Laravel', 'results_count' => 5]);
        Search::create(['user_id' => $user->id, 'query' => 'React', 'results_count' => 3]);

        $recent = $this->service->getRecentSearches($user, 5);

        $this->assertCount(2, $recent);
    }

    public function test_recent_searches_are_ordered_by_date(): void
    {
        $user = User::factory()->create();

        $oldSearch = Search::create([
            'user_id' => $user->id,
            'query' => 'Old Search',
            'results_count' => 1,
        ]);
        // Manually update created_at after creation
        $oldSearch->created_at = now()->subDay();
        $oldSearch->save();

        Search::create([
            'user_id' => $user->id,
            'query' => 'New Search',
            'results_count' => 1,
        ]);

        $recent = $this->service->getRecentSearches($user, 5);

        $this->assertEquals('New Search', $recent->first()->query);
    }

    public function test_recent_searches_respects_limit(): void
    {
        $user = User::factory()->create();

        for ($i = 1; $i <= 10; $i++) {
            Search::create(['user_id' => $user->id, 'query' => "Search $i", 'results_count' => 1]);
        }

        $recent = $this->service->getRecentSearches($user, 3);

        $this->assertCount(3, $recent);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getTrendingSearches() method tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_trending_searches(): void
    {
        // Create searches with different frequencies
        for ($i = 0; $i < 10; $i++) {
            Search::create(['query' => 'Popular Term', 'results_count' => 5]);
        }
        for ($i = 0; $i < 3; $i++) {
            Search::create(['query' => 'Less Popular', 'results_count' => 2]);
        }

        Cache::flush();
        $trending = $this->service->getTrendingSearches(7, 5);

        $this->assertNotEmpty($trending);
        $this->assertEquals('Popular Term', $trending[0]);
    }

    public function test_trending_excludes_old_searches(): void
    {
        Search::create([
            'query' => 'Old Trend',
            'results_count' => 10,
            'created_at' => now()->subDays(30),
        ]);
        Search::create([
            'query' => 'Recent Trend',
            'results_count' => 5,
            'created_at' => now(),
        ]);

        Cache::flush();
        $trending = $this->service->getTrendingSearches(7, 5);

        $this->assertContains('Recent Trend', $trending);
        $this->assertNotContains('Old Trend', $trending);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getCategories() method tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_categories_with_counts(): void
    {
        Course::factory()->approved()->count(3)->create(['category' => 'Web Development']);
        Course::factory()->approved()->count(2)->create(['category' => 'Data Science']);
        Course::factory()->create(['category' => 'Draft Category']); // Not approved

        Cache::flush();
        $categories = $this->service->getCategories();

        $this->assertCount(2, $categories);

        $webDev = collect($categories)->firstWhere('name', 'Web Development');
        $this->assertEquals(3, $webDev['count']);
        $this->assertEquals('web-development', $webDev['slug']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getCoursesByCategory() method tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_courses_by_category_slug(): void
    {
        Course::factory()->approved()->create([
            'title' => 'Web Course 1',
            'category' => 'Web Development',
        ]);
        Course::factory()->approved()->create([
            'title' => 'Web Course 2',
            'category' => 'Web Development',
        ]);
        Course::factory()->approved()->create([
            'title' => 'Data Course',
            'category' => 'Data Science',
        ]);

        $courses = $this->service->getCoursesByCategory('web-development');

        $this->assertCount(2, $courses);
        $courses->each(fn ($course) => $this->assertEquals('Web Development', $course->category));
    }

    public function test_category_search_only_returns_approved(): void
    {
        Course::factory()->create(['category' => 'Web Development']); // Draft
        Course::factory()->approved()->create(['category' => 'Web Development']);

        $courses = $this->service->getCoursesByCategory('web-development');

        $this->assertCount(1, $courses);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Return structure tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_search_returns_correct_structure(): void
    {
        Course::factory()->approved()->create(['title' => 'Laravel Course']);

        $result = $this->service->search('Laravel', [], 'relevance');

        $this->assertArrayHasKey('results', $result);
        $this->assertArrayHasKey('total', $result);
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $result['results']);
        $this->assertIsInt($result['total']);
    }

    public function test_search_loads_instructor_relationship(): void
    {
        $instructor = User::factory()->create(['name' => 'John Instructor']);
        Course::factory()->approved()->create([
            'title' => 'Laravel Course',
            'instructor_id' => $instructor->id,
        ]);

        $result = $this->service->search('Laravel', [], 'relevance');

        $this->assertTrue($result['results']->first()->relationLoaded('instructor'));
        $this->assertEquals('John Instructor', $result['results']->first()->instructor->name);
    }
}
