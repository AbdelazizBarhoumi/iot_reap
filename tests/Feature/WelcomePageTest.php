<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Models\Course;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WelcomePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_sees_only_featured_approved_courses(): void
    {
        // create some approved and other courses
        Course::factory()->approved()->count(5)->create();
        Course::factory()->rejected()->count(2)->create();
        Course::factory()->pendingReview()->count(1)->create();

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('featuredCourses', 3)
            ->whereAll([ // all featured courses should have approved status
                'featuredCourses.0.status' => CourseStatus::APPROVED->value,
            ])
        );

        // ensure no rejected/pending courses were returned
        $data = $response->original->getData()['page']['props'];
        $statuses = array_column($data['featuredCourses'], 'status');
        $this->assertNotContains(CourseStatus::REJECTED->value, $statuses);
        $this->assertNotContains(CourseStatus::PENDING_REVIEW->value, $statuses);
    }
}
