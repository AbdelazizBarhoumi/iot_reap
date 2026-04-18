<?php

namespace Tests\Unit\Services;

use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\TrainingUnitNote;
use App\Models\User;
use App\Services\TrainingUnitNoteService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingUnitNoteServiceTest extends TestCase
{
    use RefreshDatabase;

    private TrainingUnitNoteService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(TrainingUnitNoteService::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // createNote() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_creates_note_for_trainingUnit(): void
    {
        $user = User::factory()->create();
        $trainingUnit = TrainingUnit::factory()->create();

        $note = $this->service->createNote($user, $trainingUnit->id, 'My note content', 120);

        $this->assertInstanceOf(TrainingUnitNote::class, $note);
        $this->assertEquals('My note content', $note->content);
        $this->assertEquals(120, $note->timestamp_seconds);
        $this->assertDatabaseHas('training_unit_notes', [
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
            'content' => 'My note content',
            'timestamp_seconds' => 120,
        ]);
    }

    public function test_creates_note_without_timestamp(): void
    {
        $user = User::factory()->create();
        $trainingUnit = TrainingUnit::factory()->create();

        $note = $this->service->createNote($user, $trainingUnit->id, 'Note without timestamp');

        $this->assertNull($note->timestamp_seconds);
        $this->assertDatabaseHas('training_unit_notes', [
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
            'content' => 'Note without timestamp',
            'timestamp_seconds' => null,
        ]);
    }

    public function test_creates_multiple_notes_for_same_trainingUnit(): void
    {
        $user = User::factory()->create();
        $trainingUnit = TrainingUnit::factory()->create();

        $note1 = $this->service->createNote($user, $trainingUnit->id, 'First note', 60);
        $note2 = $this->service->createNote($user, $trainingUnit->id, 'Second note', 120);

        $this->assertNotEquals($note1->id, $note2->id);
        $this->assertCount(2, TrainingUnitNote::where('user_id', $user->id)->get());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getNotesForTrainingUnit() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_notes_for_user_and_trainingUnit(): void
    {
        $user = User::factory()->create();
        $trainingUnit = TrainingUnit::factory()->create();

        TrainingUnitNote::factory()->count(3)->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
        ]);

        $notes = $this->service->getNotesForTrainingUnit($user, $trainingUnit->id);

        $this->assertCount(3, $notes);
        $notes->each(fn ($note) => $this->assertEquals($user->id, $note->user_id));
    }

    public function test_does_not_return_other_users_notes(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $trainingUnit = TrainingUnit::factory()->create();

        TrainingUnitNote::factory()->count(2)->create([
            'user_id' => $user1->id,
            'training_unit_id' => $trainingUnit->id,
        ]);
        TrainingUnitNote::factory()->count(3)->create([
            'user_id' => $user2->id,
            'training_unit_id' => $trainingUnit->id,
        ]);

        $notes = $this->service->getNotesForTrainingUnit($user1, $trainingUnit->id);

        $this->assertCount(2, $notes);
        $notes->each(fn ($note) => $this->assertEquals($user1->id, $note->user_id));
    }

    public function test_returns_empty_collection_when_no_notes(): void
    {
        $user = User::factory()->create();
        $trainingUnit = TrainingUnit::factory()->create();

        $notes = $this->service->getNotesForTrainingUnit($user, $trainingUnit->id);

        $this->assertCount(0, $notes);
        $this->assertTrue($notes->isEmpty());
    }

    public function test_notes_are_ordered_by_timestamp(): void
    {
        $user = User::factory()->create();
        $trainingUnit = TrainingUnit::factory()->create();

        TrainingUnitNote::factory()->atTimestamp(300)->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
            'content' => 'Third',
        ]);
        TrainingUnitNote::factory()->atTimestamp(60)->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
            'content' => 'First',
        ]);
        TrainingUnitNote::factory()->atTimestamp(180)->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
            'content' => 'Second',
        ]);

        $notes = $this->service->getNotesForTrainingUnit($user, $trainingUnit->id);

        $this->assertEquals('First', $notes[0]->content);
        $this->assertEquals('Second', $notes[1]->content);
        $this->assertEquals('Third', $notes[2]->content);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getNotesForTrainingPath() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_notes_for_user_across_trainingPath(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit1 = TrainingUnit::factory()->create(['module_id' => $module->id]);
        $trainingUnit2 = TrainingUnit::factory()->create(['module_id' => $module->id]);

        TrainingUnitNote::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit1->id,
        ]);
        TrainingUnitNote::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit2->id,
        ]);

        $notes = $this->service->getNotesForTrainingPath($user, $trainingPath->id);

        $this->assertCount(2, $notes);
    }

    public function test_does_not_return_notes_from_other_trainingPaths(): void
    {
        $user = User::factory()->create();
        $trainingPath1 = TrainingPath::factory()->create();
        $trainingPath2 = TrainingPath::factory()->create();
        $module1 = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath1->id]);
        $module2 = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath2->id]);
        $trainingUnit1 = TrainingUnit::factory()->create(['module_id' => $module1->id]);
        $trainingUnit2 = TrainingUnit::factory()->create(['module_id' => $module2->id]);

        TrainingUnitNote::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit1->id,
        ]);
        TrainingUnitNote::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit2->id,
        ]);

        $notes = $this->service->getNotesForTrainingPath($user, $trainingPath1->id);

        $this->assertCount(1, $notes);
        $this->assertEquals($trainingUnit1->id, $notes->first()->training_unit_id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // updateNote() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_updates_note_content(): void
    {
        $user = User::factory()->create();
        $note = TrainingUnitNote::factory()->create([
            'user_id' => $user->id,
            'content' => 'Original content',
            'timestamp_seconds' => 60,
        ]);

        $updated = $this->service->updateNote($user, $note->id, 'Updated content', 120);

        $this->assertEquals('Updated content', $updated->content);
        $this->assertEquals(120, $updated->timestamp_seconds);
        $this->assertDatabaseHas('training_unit_notes', [
            'id' => $note->id,
            'content' => 'Updated content',
            'timestamp_seconds' => 120,
        ]);
    }

    public function test_updates_note_timestamp_to_null(): void
    {
        $user = User::factory()->create();
        $note = TrainingUnitNote::factory()->create([
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
        $note = TrainingUnitNote::factory()->create(['user_id' => $user1->id]);

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
        $note = TrainingUnitNote::factory()->create(['user_id' => $user->id]);
        $noteId = $note->id;

        $result = $this->service->deleteNote($user, $noteId);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('training_unit_notes', ['id' => $noteId]);
    }

    public function test_delete_throws_exception_for_other_users_note(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $note = TrainingUnitNote::factory()->create(['user_id' => $user1->id]);

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
        $note = TrainingUnitNote::factory()->create(['user_id' => $user1->id]);

        try {
            $this->service->deleteNote($user2, $note->id);
        } catch (AuthorizationException) {
            // Expected
        }

        $this->assertDatabaseHas('training_unit_notes', ['id' => $note->id]);
    }
}
