<?php

namespace Database\Seeders;

use App\Enums\VideoStatus;
use App\Models\Article;
use App\Models\Certificate;
use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\TrainingPathReview;
use App\Models\TrainingUnit;
use App\Models\TrainingUnitNote;
use App\Models\Video;
use App\Models\VideoProgress;
use Illuminate\Database\Seeder;

/**
 * Seeds videos, video progress, trainingUnit notes, trainingPath reviews, and certificates.
 */
class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $enrollments = TrainingPathEnrollment::with('trainingPath', 'user')->get();
        $trainingUnits = TrainingUnit::all();

        if ($enrollments->isEmpty() || $trainingUnits->isEmpty()) {
            $this->command->warn('No enrollments or trainingUnits found. Skipping content.');
            return;
        }

        // ── Seed videos for trainingUnits ──
        foreach ($trainingUnits->where('type', 'video') as $trainingUnit) {
            Video::create([
                'training_unit_id' => $trainingUnit->id,
                'original_filename' => 'video_' . $trainingUnit->id . '.mp4',
                'storage_path' => 'videos/trainingUnits/' . $trainingUnit->id . '/video.mp4',
                'storage_disk' => 'local',
                'duration_seconds' => rand(300, 3600),
                'file_size_bytes' => rand(100000000, 1000000000),
                'mime_type' => 'video/mp4',
                'status' => VideoStatus::READY,
                'thumbnail_path' => 'videos/trainingUnits/' . $trainingUnit->id . '/thumb.jpg',
                'hls_path' => 'videos/trainingUnits/' . $trainingUnit->id . '/master.m3u8',
                'available_qualities' => json_encode(['360p', '720p', '1080p']),
                'resolution_width' => 1920,
                'resolution_height' => 1080,
            ]);
        }

        // ── Seed articles for reading trainingUnits ──
        foreach ($trainingUnits->where('type', 'reading') as $trainingUnit) {
            $content = $this->generateArticleContent();
            $wordCount = str_word_count($content);
            Article::create([
                'training_unit_id' => $trainingUnit->id,
                'content' => json_encode(['body' => $content, 'sections' => []]),
                'word_count' => $wordCount,
                'estimated_read_time_minutes' => max(1, (int)($wordCount / 200)),
            ]);
        }

        // ── Seed video progress ──
        $videos = Video::all();
        foreach ($enrollments->random(min(3, count($enrollments))) as $enrollment) {
            // Create one progress entry per unique video to avoid unique constraint violations
            $videosToTrack = $videos->shuffle()->slice(0, min(2, $videos->count()));
            foreach ($videosToTrack as $video) {
                $watchedSeconds = rand(0, (int)($video->duration_seconds ?? 600));
                VideoProgress::firstOrCreate(
                    [
                        'user_id' => $enrollment->user_id,
                        'video_id' => $video->id,
                    ],
                    [
                        'watched_seconds' => $watchedSeconds,
                        'total_watch_time' => $watchedSeconds + rand(0, 300),
                        'completed' => $watchedSeconds >= (int)(($video->duration_seconds ?? 600) * 0.9),
                        'last_watched_at' => now()->subDays(rand(0, 20)),
                    ]
                );
            }
        }

        // ── Seed trainingUnit notes ──
        foreach ($enrollments->random(min(3, count($enrollments))) as $enrollment) {
            $trainingUnitsToNote = $trainingUnits->random(min(3, count($trainingUnits)));
            foreach ($trainingUnitsToNote as $trainingUnit) {
                TrainingUnitNote::create([
                    'user_id' => $enrollment->user_id,
                    'training_unit_id' => $trainingUnit->id,
                    'content' => $this->generateNoteContent(),
                    'created_at' => now()->subDays(rand(1, 30)),
                ]);
            }
        }

        // ── Seed trainingPath reviews ──
        foreach ($enrollments->random(min(3, count($enrollments))) as $enrollment) {
            TrainingPathReview::create([
                'user_id' => $enrollment->user_id,
                'training_path_id' => $enrollment->training_path_id,
                'rating' => rand(3, 5),
                'review' => $this->generateReviewTitle() . "\n\n" . $this->generateReviewContent(),
            ]);
        }

        // ── Seed certificates for completed trainingPaths ──
        $completedEnrollments = $enrollments->filter(function($e) { return $e->completed_at !== null; });
        if ($completedEnrollments->isNotEmpty()) {
            foreach ($completedEnrollments->random(min(max(1, (int)($completedEnrollments->count() / 2)), $completedEnrollments->count())) as $enrollment) {
                Certificate::create([
                    'user_id' => $enrollment->user_id,
                    'training_path_id' => $enrollment->training_path_id,
                    'hash' => hash('sha256', $enrollment->user_id . $enrollment->training_path_id . now()),
                    'pdf_path' => null,
                    'issued_at' => now()->subDays(rand(1, 30)),
                ]);
            }
        }

        $this->command->info('Seeded videos, video progress, notes, reviews, and certificates.');
    }

    private function generateArticleContent(): string
    {
        $sections = [
            'This comprehensive guide explores the fundamentals of modern industrial systems. Understanding these concepts is crucial for professionals in the field.',
            'The framework consists of multiple interconnected layers, each serving a specific purpose in the overall architecture.',
            'Best practices include regular monitoring, proactive maintenance, and continuous improvement of processes.',
            'Implementation should follow industry standards and adhere to safety regulations.',
            'Real-world applications demonstrate the value of proper system design and careful planning.',
        ];

        return implode("\n\n", $sections);
    }

    private function generateNoteContent(): string
    {
        $notes = [
            'Key takeaway: This concept is fundamental to understanding the system.',
            'Important point: Remember to consider all edge cases.',
            'Note: This approach works best in production environments.',
            'Reminder: Always validate assumptions before implementation.',
            'Useful pattern: This technique can be applied to similar problems.',
        ];

        return $notes[array_rand($notes)];
    }

    private function generateReviewTitle(): string
    {
        $titles = [
            'Excellent trainingPath, highly recommend!',
            'Well-structured and comprehensive',
            'Great instructor, practical content',
            'Perfect for getting started',
            'Detailed and informative',
        ];

        return $titles[array_rand($titles)];
    }

    private function generateReviewContent(): string
    {
        $reviews = [
            'This trainingPath exceeded my expectations. The instructor explained complex concepts clearly.',
            'Great value for the price. Lots of practical examples that I can apply immediately.',
            'Well-organized curriculum with good pacing. The hands-on labs were particularly useful.',
            'I learned more in this trainingPath than in months of self-study.',
            'Highly recommend for anyone looking to improve their skills.',
        ];

        return $reviews[array_rand($reviews)];
    }
}
