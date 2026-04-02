<?php

namespace Tests\Unit\Services;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\LessonNote;
use App\Models\User;
use App\Services\LessonNoteService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonNoteServiceTest extends TestCase
{
    use RefreshDatabase;

    private LessonNoteService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(LessonNoteService::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // createNote() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_creates_note_for_lesson(): void
    {
        $user = User::factory()->create();
        $lesson = Lesson::factory()->create();

        $note = $this->service->createNote($user, $lesson->id, 'My note content', 120);

        $this->assertInstanceOf(LessonNote::class, $note);
        $this->assertEquals('My note content', $note->content);
        $this->assertEquals(120, $note->timestamp_seconds);
        $this->assertDatabaseHas('lesson_notes', [
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'content' => 'My note content',
            'timestamp_seconds' => 120,
        ]);
    }

    public function test_creates_note_without_timestamp(): void
    {
        $user = User::factory()->create();
        $lesson = Lesson::factory()->create();

        $note = $this->service->createNote($user, $lesson->id, 'Note without timestamp');

        $this->assertNull($note->timestamp_seconds);
        $this->assertDatabaseHas('lesson_notes', [
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'content' => 'Note without timestamp',
            'timestamp_seconds' => null,
        ]);
    }

    public function test_creates_multiple_notes_for_same_lesson(): void
    {
        $user = User::factory()->create();
        $lesson = Lesson::factory()->create();

        $note1 = $this->service->createNote($user, $lesson->id, 'First note', 60);
        $note2 = $this->service->createNote($user, $lesson->id, 'Second note', 120);

        $this->assertNotEquals($note1->id, $note2->id);
        $this->assertCount(2, LessonNote::where('user_id', $user->id)->get());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getNotesForLesson() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_notes_for_user_and_lesson(): void
    {
        $user = User::factory()->create();
        $lesson = Lesson::factory()->create();

        LessonNote::factory()->count(3)->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
        ]);

        $notes = $this->service->getNotesForLesson($user, $lesson->id);

        $this->assertCount(3, $notes);
        $notes->each(fn ($note) => $this->assertEquals($user->id, $note->user_id));
    }

    public function test_does_not_return_other_users_notes(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $lesson = Lesson::factory()->create();

        LessonNote::factory()->count(2)->create([
            'user_id' => $user1->id,
            'lesson_id' => $lesson->id,
        ]);
        LessonNote::factory()->count(3)->create([
            'user_id' => $user2->id,
            'lesson_id' => $lesson->id,
        ]);

        $notes = $this->service->getNotesForLesson($user1, $lesson->id);

        $this->assertCount(2, $notes);
        $notes->each(fn ($note) => $this->assertEquals($user1->id, $note->user_id));
    }

    public function test_returns_empty_collection_when_no_notes(): void
    {
        $user = User::factory()->create();
        $lesson = Lesson::factory()->create();

        $notes = $this->service->getNotesForLesson($user, $lesson->id);

        $this->assertCount(0, $notes);
        $this->assertTrue($notes->isEmpty());
    }

    public function test_notes_are_ordered_by_timestamp(): void
    {
        $user = User::factory()->create();
        $lesson = Lesson::factory()->create();

        LessonNote::factory()->atTimestamp(300)->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'content' => 'Third',
        ]);
        LessonNote::factory()->atTimestamp(60)->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'content' => 'First',
        ]);
        LessonNote::factory()->atTimestamp(180)->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'content' => 'Second',
        ]);

        $notes = $this->service->getNotesForLesson($user, $lesson->id);

        $this->assertEquals('First', $notes[0]->content);
        $this->assertEquals('Second', $notes[1]->content);
        $this->assertEquals('Third', $notes[2]->content);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getNotesForCourse() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_notes_for_user_across_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson1 = Lesson::factory()->create(['module_id' => $module->id]);
        $lesson2 = Lesson::factory()->create(['module_id' => $module->id]);

        LessonNote::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson1->id,
        ]);
        LessonNote::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson2->id,
        ]);

        $notes = $this->service->getNotesForCourse($user, $course->id);

        $this->assertCount(2, $notes);
    }

    public function test_does_not_return_notes_from_other_courses(): void
    {
        $user = User::factory()->create();
        $course1 = Course::factory()->create();
        $course2 = Course::factory()->create();
        $module1 = CourseModule::factory()->create(['course_id' => $course1->id]);
        $module2 = CourseModule::factory()->create(['course_id' => $course2->id]);
        $lesson1 = Lesson::factory()->create(['module_id' => $module1->id]);
        $lesson2 = Lesson::factory()->create(['module_id' => $module2->id]);

        LessonNote::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson1->id,
        ]);
        LessonNote::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson2->id,
        ]);

        $notes = $this->service->getNotesForCourse($user, $course1->id);

        $this->assertCount(1, $notes);
        $this->assertEquals($lesson1->id, $notes->first()->lesson_id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // updateNote() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_updates_note_content(): void
    {
        $user = User::factory()->create();
        $note = LessonNote::factory()->create([
            'user_id' => $user->id,
            'content' => 'Original content',
            'timestamp_seconds' => 60,
        ]);

        $updated = $this->service->updateNote($user, $note->id, 'Updated content', 120);

        $this->assertEquals('Updated content', $updated->content);
        $this->assertEquals(120, $updated->timestamp_seconds);
        $this->assertDatabaseHas('lesson_notes', [
            'id' => $note->id,
            'content' => 'Updated content',
            'timestamp_seconds' => 120,
        ]);
    }

    public function test_updates_note_timestamp_to_null(): void
    {
        $user = User::factory()->create();
        $note = LessonNote::factory()->create([
            'user_id' => $user->id,
            'timestamp_seconds' => 60,
        ]);

        $updated = $this->service->updateNote($user, $note->id, 'Content', null);

        $this->assertNull($updated->timestamp_seconds);
    }

    public function test_update_throws_exception_for_other_users_note(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $note = LessonNote::factory()->create(['user_id' => $user1->id]);

        $this->expectException(AuthorizationException::class);
        $this->expectExceptionMessage('Note not found or access denied.');

        $this->service->updateNote($user2, $note->id, 'Hacked content');
    }

    public function test_update_throws_exception_for_nonexistent_note(): void
    {
        $user = User::factory()->create();

        $this->expectException(AuthorizationException::class);
        $this->expectExceptionMessage('Note not found or access denied.');

        $this->service->updateNote($user, 99999, 'Content');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // deleteNote() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_deletes_note(): void
    {
        $user = User::factory()->create();
        $note = LessonNote::factory()->create(['user_id' => $user->id]);
        $noteId = $note->id;

        $result = $this->service->deleteNote($user, $noteId);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('lesson_notes', ['id' => $noteId]);
    }

    public function test_delete_throws_exception_for_other_users_note(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $note = LessonNote::factory()->create(['user_id' => $user1->id]);

        $this->expectException(AuthorizationException::class);
        $this->expectExceptionMessage('Note not found or access denied.');

        $this->service->deleteNote($user2, $note->id);
    }

    public function test_delete_throws_exception_for_nonexistent_note(): void
    {
        $user = User::factory()->create();

        $this->expectException(AuthorizationException::class);
        $this->expectExceptionMessage('Note not found or access denied.');

        $this->service->deleteNote($user, 99999);
    }

    public function test_note_remains_in_db_if_delete_fails_for_authorization(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $note = LessonNote::factory()->create(['user_id' => $user1->id]);

        try {
            $this->service->deleteNote($user2, $note->id);
        } catch (AuthorizationException) {
            // Expected
        }

        $this->assertDatabaseHas('lesson_notes', ['id' => $note->id]);
    }
}
