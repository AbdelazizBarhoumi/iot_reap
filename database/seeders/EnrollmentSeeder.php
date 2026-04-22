<?php

namespace Database\Seeders;

use App\Enums\TrainingPathStatus;
use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\TrainingUnit;
use App\Models\TrainingUnitProgress;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds trainingPath enrollments and trainingUnit progress tracking.
 *
 * Creates realistic enrollment scenarios:
 * - Some users enrolled, some trainingUnits completed
 * - Mixed completion percentages
 * - Video watched scenarios
 */
class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $engineers = User::where('role', 'engineer')->get();
        $trainingPaths = TrainingPath::where('status', TrainingPathStatus::APPROVED)->get();

        if ($engineers->isEmpty() || $trainingPaths->isEmpty()) {
            $this->command->warn('No engineers or approved trainingPaths found. Skipping enrollments.');

            return;
        }

        // ── Enrollment patterns ──
        $enrollmentPatterns = [
            // User 0: Enrolled in 3 trainingPaths
            ['training_path_indices' => [0, 1, 2], 'completion_ratios' => [0.8, 0.5, 0.2]],
            // User 1: Enrolled in 2 trainingPaths
            ['training_path_indices' => [1, 3], 'completion_ratios' => [1.0, 0.6]],
            // User 2: Enrolled in all trainingPaths
            ['training_path_indices' => [0, 1, 2, 3, 4, 5], 'completion_ratios' => [0.3, 0.1, 0.0, 0.5, 0.7, 0.2]],
            // User 3: Enrolled in 4 trainingPaths
            ['training_path_indices' => [2, 3, 4, 5], 'completion_ratios' => [0.6, 0.8, 0.4, 0.9]],
        ];

        foreach ($engineers as $userIndex => $engineer) {
            if (! isset($enrollmentPatterns[$userIndex])) {
                continue;
            }

            $pattern = $enrollmentPatterns[$userIndex];
            $trainingPathList = $trainingPaths->all();

            foreach ($pattern['training_path_indices'] as $trainingPathIdx => $trainingPathIndex) {
                if (! isset($trainingPathList[$trainingPathIndex])) {
                    continue;
                }

                $trainingPath = $trainingPathList[$trainingPathIndex];
                $completionRatio = $pattern['completion_ratios'][$trainingPathIdx];

                // Create enrollment
                $enrollment = TrainingPathEnrollment::create([
                    'user_id' => $engineer->id,
                    'training_path_id' => $trainingPath->id,
                    'enrolled_at' => now()->subDays(rand(10, 60)),
                    'completed_at' => $completionRatio === 1.0 ? now()->subDays(rand(1, 30)) : null,
                ]);

                // Create trainingUnit progress for enrolled trainingPath
                $this->seedTrainingUnitProgress($engineer, $trainingPath, $completionRatio);
            }
        }

        $this->command->info('Seeded trainingPath enrollments and trainingUnit progress.');
    }

    /**
     * Seed trainingUnit progress for a user in a trainingPath.
     */
    private function seedTrainingUnitProgress($user, $trainingPath, float $completionRatio): void
    {
        $trainingUnits = TrainingUnit::whereHas('module', function ($q) use ($trainingPath) {
            $q->where('training_path_id', $trainingPath->id);
        })->get();

        if ($trainingUnits->isEmpty()) {
            return;
        }

        $trainingUnitsToComplete = intval(count($trainingUnits) * $completionRatio);
        $selectedTrainingUnits = $trainingUnitsToComplete > 0 ? $trainingUnits->random(min($trainingUnitsToComplete, count($trainingUnits))) : collect();

        foreach ($selectedTrainingUnits as $trainingUnit) {
            TrainingUnitProgress::create([
                'user_id' => $user->id,
                'training_unit_id' => $trainingUnit->id,
                'completed' => true,
                'completed_at' => now()->subDays(rand(1, 30)),
                'video_watch_percentage' => $trainingUnit->type->value === 'video' ? rand(80, 100) : 0,
                'video_position_seconds' => 0,
                'quiz_passed' => rand(0, 1) === 1,
                'article_read' => $trainingUnit->type->value === 'reading',
                'article_read_at' => $trainingUnit->type->value === 'reading' ? now()->subDays(rand(1, 30)) : null,
            ]);
        }
    }
}
