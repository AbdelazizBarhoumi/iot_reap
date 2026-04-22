<?php

namespace Tests\Unit\Services;

use App\Models\DailyTrainingPathStats;
use App\Models\TrainingPath;
use App\Models\User;
use App\Repositories\TrainingPathStatsRepository;
use App\Services\TrainingPathAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingPathAnalyticsServiceManualTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_with_manually_injected_repository(): void
    {
        $teacher = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyTrainingPathStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create(['training_path_id' => $trainingPath->id, 'enrollments' => 10]);

        DailyTrainingPathStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['training_path_id' => $trainingPath->id, 'enrollments' => 15]);

        // Manually instantiate the repository and service
        $repo = new TrainingPathStatsRepository(new DailyTrainingPathStats);
        $service = new TrainingPathAnalyticsService($repo);

        $kpis = $service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(25, $kpis['total_enrollments']);
    }

    public function test_service_with_app_resolve(): void
    {
        $teacher = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyTrainingPathStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create(['training_path_id' => $trainingPath->id, 'enrollments' => 10]);

        DailyTrainingPathStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['training_path_id' => $trainingPath->id, 'enrollments' => 15]);

        // Use app() like the original test does
        $service = app(TrainingPathAnalyticsService::class);

        $kpis = $service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(25, $kpis['total_enrollments']);
    }
}
