<?php

namespace Tests\Unit\Repositories;

use App\Models\TrainingPath;
use App\Repositories\TrainingPathRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingPathRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private TrainingPathRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = app(TrainingPathRepository::class);
    }

    public function test_search_with_filters_matches_partial_title(): void
    {
        TrainingPath::factory()->approved()->create([
            'title' => 'Introduction to Industrial IoT',
            'description' => 'Hands-on labs and practical examples.',
        ]);

        TrainingPath::factory()->approved()->create([
            'title' => 'Advanced PLC Programming',
            'description' => 'Deep dive into programmable logic controllers.',
        ]);

        $results = $this->repository->searchWithFilters('Indust', []);

        $this->assertCount(1, $results);
        $this->assertSame('Introduction to Industrial IoT', $results->first()->title);
    }
}
