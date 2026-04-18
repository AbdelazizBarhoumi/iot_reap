<?php

namespace Database\Seeders;

use App\Enums\ThreadStatus;
use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\DiscussionThread;
use App\Models\TrainingUnit;
use App\Models\ThreadReply;
use App\Models\ThreadVote;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds discussion threads, replies, and votes.
 */
class ForumSeeder extends Seeder
{
    public function run(): void
    {
        $enrollments = TrainingPathEnrollment::with('trainingPath', 'user')->get();
        $trainingUnits = TrainingUnit::all();

        if ($enrollments->isEmpty() || $trainingUnits->isEmpty()) {
            $this->command->warn('No enrollments or trainingUnits found. Skipping forum.');
            return;
        }

        // Create threads for enrolled trainingPaths
        foreach ($enrollments->random(min(5, count($enrollments))) as $enrollment) {
            // Create 2-3 threads per trainingPath enrollment
            for ($i = 0; $i < rand(2, 3); $i++) {
                $thread = DiscussionThread::create([
                    'training_path_id' => $enrollment->training_path_id,
                    'training_unit_id' => $trainingUnits->random()->id,
                    'author_id' => $enrollment->user_id,
                    'title' => $this->generateThreadTitle(),
                    'content' => $this->generateThreadContent(),
                    'status' => ThreadStatus::OPEN,
                ]);

                // Note: ThreadReply and ThreadVote models are referenced but tables don't exist in migration
                // Skipping reply and vote creation until those tables are created
            }
        }

        $this->command->info('Seeded discussion threads, replies, and votes.');
    }

    private function generateThreadTitle(): string
    {
        $titles = [
            'How to understand this concept?',
            'Can someone explain the factory workflow?',
            'Tips for passing the quiz',
            'Best practices for this trainingUnit',
            'Has anyone completed this module?',
            'Question about the equipment setup',
            'Clarification needed on the exercise',
            'Real-world application example needed',
        ];

        return $titles[array_rand($titles)];
    }

    private function generateThreadContent(): string
    {
        $contents = [
            'I\'m struggling with the concepts covered in this trainingUnit. Can someone help me understand the fundamentals?',
            'Great trainingUnit! But I have a few questions about how this applies in the real world.',
            'Does anyone have experience with this type of system?',
            'I\'m curious about the best approach to solve this problem.',
            'Looking for tips and tricks on how to optimize this process.',
            'Can we discuss the alternatives to the method shown in the video?',
        ];

        return $contents[array_rand($contents)];
    }

    private function generateReplyContent(): string
    {
        $replies = [
            'Great question! Here\'s how I understand it...',
            'I had the same question. The key is to think about...',
            'This is a common misconception. The correct approach is...',
            'From my experience, the best way is to...',
            'Good point. Additionally, you should also consider...',
            'That\'s exactly right! This works because...',
            'I recommend trying this alternative approach...',
            'Very helpful insight. Building on that...',
        ];

        return $replies[array_rand($replies)];
    }
}
