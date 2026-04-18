<?php

namespace Tests\Unit\Services;

use App\Models\TrainingPath;
use App\Models\DailyTrainingPathStats;
use App\Models\User;
use App\Repositories\TrainingPathStatsRepository;
use App\Services\TrainingPathAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebugServiceCallTest extends TestCase
{
    use RefreshDatabase;

    public function test_debug_service_call(): void
    {
        $teacher = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create(['instructor_id' => $teacher->id]);

        echo "\n\nTeacher ID: $teacher->id\n";
        echo "TrainingPath ID: $trainingPath->id\n";
        echo "TrainingPath instructor_id: $trainingPath->instructor_id\n";

        $date1 = now()->subDays(3)->toDateString();
        $date2 = now()->subDays(5)->toDateString();

        echo "Creating stats for dates: $date1 and $date2\n";

        DailyTrainingPathStats::factory()
            ->forDate($date1)
            ->create(['training_path_id' => $trainingPath->id, 'enrollments' => 10]);

        DailyTrainingPathStats::factory()
            ->forDate($date2)
            ->create(['training_path_id' => $trainingPath->id, 'enrollments' => 15]);

        $startDate = now()->subDays(29)->toDateString();
        $endDate = now()->toDateString();

        // Try calling sum on ::query()
        echo "\nTesting ::query()->join()->sum():\n";
        $result1 = DailyTrainingPathStats::query()
            ->join('training_paths', 'daily_training_path_stats.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacher->id)
            ->whereBetween('daily_training_path_stats.date', [$startDate, $endDate])
            ->sum('daily_training_path_stats.enrollments');
        echo "Result: $result1\n";

        // Try calling get first
        echo "\nTesting ::query()->join()->get():\n";
        $results = DailyTrainingPathStats::query()
            ->join('training_paths', 'daily_training_path_stats.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacher->id)
            ->whereBetween('daily_training_path_stats.date', [$startDate, $endDate])
            ->get();
        echo "Result count: " . $results->count() . "\n";

        // Try a different approach - store query first
        echo "\nTesting stored query builder->sum():\n";
        $query = DailyTrainingPathStats::query()
            ->join('training_paths', 'daily_training_path_stats.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacher->id)
            ->whereBetween('daily_training_path_stats.date', [$startDate, $endDate]);
        $result2 = $query->sum('daily_training_path_stats.enrollments');
        echo "Result: $result2\n";

        $this->assertEquals(25, $result1);
    }
}
