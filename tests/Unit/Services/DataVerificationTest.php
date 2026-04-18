<?php

namespace Tests\Unit\Services;

use App\Models\TrainingPath;
use App\Models\DailyTrainingPathStats;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_data_can_be_queried_after_creation(): void
    {
        $teacher = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyTrainingPathStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create(['training_path_id' => $trainingPath->id, 'enrollments' => 10]);

        // Verify data exists
        $allStats = DailyTrainingPathStats::all();
        $this->assertGreaterThan(0, $allStats->count(), 'Stats should exist');

        $allTrainingPaths = TrainingPath::all();
        $this->assertGreaterThan(0, $allTrainingPaths->count(), 'TrainingPaths should exist');

        $statsForTrainingPath = DailyTrainingPathStats::where('training_path_id', $trainingPath->id)->get();
        $this->assertGreaterThan(0, $statsForTrainingPath->count(), 'Stats for trainingPath should exist');

        $thisTeacherTrainingPaths = TrainingPath::where('instructor_id', $teacher->id)->get();
        $this->assertGreaterThan(0, $thisTeacherTrainingPaths->count(), 'TrainingPaths for teacher should exist');

        // Now test the JOIN
        $statsWithTrainingPaths = DailyTrainingPathStats::join('training_paths', 'daily_training_path_stats.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacher->id)
            ->get();

        $this->assertGreaterThan(0, $statsWithTrainingPaths->count(), 'Stats with trainingPath JOIN should exist');

        // Now test with date range
        $startDate = now()->subDays(29)->toDateString();
        $endDate = now()->toDateString();

        $statsWithDateRange = DailyTrainingPathStats::join('training_paths', 'daily_training_path_stats.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacher->id)
            ->whereBetween('daily_training_path_stats.date', [$startDate, $endDate])
            ->get();

        $this->assertGreaterThan(0, $statsWithDateRange->count(), 'Stats within date range should exist');

        // Finally, test the sum
        $sumResult = DailyTrainingPathStats::join('training_paths', 'daily_training_path_stats.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacher->id)
            ->whereBetween('daily_training_path_stats.date', [$startDate, $endDate])
            ->sum('daily_training_path_stats.enrollments');

        $this->assertEquals(10, $sumResult, 'Sum should match created value');
    }
}
