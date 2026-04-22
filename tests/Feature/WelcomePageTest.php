<?php

namespace Tests\Feature;

use App\Enums\TrainingPathStatus;
use App\Models\TrainingPath;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WelcomePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_sees_only_featured_approved_training_paths(): void
    {
        // create some approved and other trainingPaths
        TrainingPath::factory()->approved()->count(5)->create();
        TrainingPath::factory()->rejected()->count(2)->create();
        TrainingPath::factory()->pendingReview()->count(1)->create();

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('featuredTrainingPaths', 3)
            ->whereAll([ // all featured trainingPaths should have approved status
                'featuredTrainingPaths.0.status' => TrainingPathStatus::APPROVED->value,
            ])
        );

        // ensure no rejected/pending trainingPaths were returned
        $data = $response->original->getData()['page']['props'];
        $statuses = array_column($data['featuredTrainingPaths'], 'status');
        $this->assertNotContains(TrainingPathStatus::REJECTED->value, $statuses);
        $this->assertNotContains(TrainingPathStatus::PENDING_REVIEW->value, $statuses);
    }
}
