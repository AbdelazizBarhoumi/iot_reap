<?php

namespace Tests\Unit\Services;

use App\Enums\QuizQuestionType;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Repositories\QuizQuestionRepository;
use App\Services\QuestionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionServiceTest extends TestCase
{
    use RefreshDatabase;

    private QuestionService $service;

    private QuizQuestionRepository $repository;

    private Quiz $quiz;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = $this->createMock(QuizQuestionRepository::class);
        $this->service = new QuestionService($this->repository);
        $this->quiz = $this->createMock(Quiz::class);
        $this->quiz->method('__get')->with('id')->willReturn(1);
    }

    public function test_create_creates_multiple_choice_question_with_options(): void
    {
        $data = [
            'type' => 'multiple_choice',
            'question' => 'What is 2+2?',
            'explanation' => 'Basic math',
            'points' => 5,
        ];

        $options = [
            ['option_text' => '3', 'is_correct' => false],
            ['option_text' => '4', 'is_correct' => true],
            ['option_text' => '5', 'is_correct' => false],
        ];

        $expectedQuestion = $this->createMock(QuizQuestion::class);

        $this->repository
            ->expects($this->once())
            ->method('getNextSortOrder')
            ->with($this->isType('int'))
            ->willReturn(1);

        $this->repository
            ->expects($this->once())
            ->method('createWithOptions')
            ->with(
                $this->callback(function ($questionData) use ($data) {
                    return is_array($questionData) &&
                           isset($questionData['quiz_id']) &&
                           $questionData['type'] === QuizQuestionType::MULTIPLE_CHOICE &&
                           $questionData['question'] === $data['question'] &&
                           $questionData['explanation'] === $data['explanation'] &&
                           $questionData['points'] === $data['points'] &&
                           $questionData['sort_order'] === 1;
                }),
                $this->equalTo($options)
            )
            ->willReturn($expectedQuestion);

        $result = $this->service->create($this->quiz, $data, $options);

        $this->assertEquals($expectedQuestion, $result);
    }

    public function test_create_creates_true_false_question_with_auto_options(): void
    {
        $data = [
            'type' => 'true_false',
            'question' => 'The sky is blue.',
            'correct_answer' => true,
            'points' => 2,
        ];

        $expectedQuestion = $this->createMock(QuizQuestion::class);

        $this->repository
            ->expects($this->once())
            ->method('getNextSortOrder')
            ->with($this->isType('int'))
            ->willReturn(1);

        $this->repository
            ->expects($this->once())
            ->method('createWithOptions')
            ->with(
                $this->isType('array'),
                $this->callback(function ($options) {
                    return count($options) === 2 &&
                           $options[0]['option_text'] === 'True' &&
                           $options[0]['is_correct'] === true &&
                           $options[1]['option_text'] === 'False' &&
                           $options[1]['is_correct'] === false;
                })
            )
            ->willReturn($expectedQuestion);

        $result = $this->service->create($this->quiz, $data); // No options passed

        $this->assertEquals($expectedQuestion, $result);
    }

    public function test_create_creates_short_answer_question_without_options(): void
    {
        $data = [
            'type' => 'short_answer',
            'question' => 'Explain the water cycle.',
            'points' => 10,
        ];

        $expectedQuestion = $this->createMock(QuizQuestion::class);

        $this->repository
            ->expects($this->once())
            ->method('getNextSortOrder')
            ->with($this->isType('int'))
            ->willReturn(1);

        $this->repository
            ->expects($this->once())
            ->method('createWithOptions')
            ->with($this->isType('array'), [])
            ->willReturn($expectedQuestion);

        $result = $this->service->create($this->quiz, $data, []);

        $this->assertEquals($expectedQuestion, $result);
    }

    public function test_create_throws_exception_for_multiple_choice_without_options(): void
    {
        $data = [
            'type' => 'multiple_choice',
            'question' => 'What is 2+2?',
        ];

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Multiple Choice questions require at least one option');

        $this->service->create($this->quiz, $data, []);
    }

    public function test_create_throws_exception_for_options_without_correct_answer(): void
    {
        $data = [
            'type' => 'multiple_choice',
            'question' => 'What is 2+2?',
        ];

        $options = [
            ['option_text' => '3', 'is_correct' => false],
            ['option_text' => '5', 'is_correct' => false],
        ];

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('At least one option must be marked as correct');

        $this->service->create($this->quiz, $data, $options);
    }

    public function test_create_throws_exception_for_true_false_with_wrong_option_count(): void
    {
        $data = [
            'type' => 'true_false',
            'question' => 'The sky is blue.',
        ];

        $options = [
            ['option_text' => 'True', 'is_correct' => true],
            ['option_text' => 'False', 'is_correct' => false],
            ['option_text' => 'Maybe', 'is_correct' => false], // Third option not allowed
        ];

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('True/False questions must have exactly 2 options');

        $this->service->create($this->quiz, $data, $options);
    }

    public function test_update_updates_question_with_options(): void
    {
        $question = $this->createMock(QuizQuestion::class);
        $question->type = QuizQuestionType::MULTIPLE_CHOICE;
        $question->question = 'Old question';
        $question->explanation = 'Old explanation';
        $question->points = 1;

        $data = [
            'type' => 'multiple_choice',
            'question' => 'Updated question',
            'points' => 3,
        ];

        $options = [
            ['option_text' => 'Option A', 'is_correct' => true],
            ['option_text' => 'Option B', 'is_correct' => false],
        ];

        $updatedQuestion = $this->createMock(QuizQuestion::class);

        $this->repository
            ->expects($this->once())
            ->method('updateWithOptions')
            ->with(
                $question,
                $this->callback(function ($updateData) use ($data) {
                    return $updateData['type'] === QuizQuestionType::MULTIPLE_CHOICE &&
                           $updateData['question'] === $data['question'] &&
                           $updateData['points'] === $data['points'];
                }),
                $options
            )
            ->willReturn($updatedQuestion);

        $result = $this->service->update($question, $data, $options);

        $this->assertEquals($updatedQuestion, $result);
    }

    public function test_update_updates_question_without_options(): void
    {
        $question = $this->createMock(QuizQuestion::class);
        $question->type = QuizQuestionType::SHORT_ANSWER;

        $data = [
            'question' => 'Updated question text',
            'points' => 5,
        ];

        $updatedQuestion = $this->createMock(QuizQuestion::class);

        $this->repository
            ->expects($this->once())
            ->method('update')
            ->with($question, $data)
            ->willReturn($updatedQuestion);

        $result = $this->service->update($question, $data);

        $this->assertEquals($updatedQuestion, $result);
    }

    public function test_delete_deletes_question_via_repository(): void
    {
        $question = $this->createMock(QuizQuestion::class);
        $question->id = 123;

        $this->repository
            ->expects($this->once())
            ->method('delete')
            ->with($question)
            ->willReturn(true);

        $result = $this->service->delete($question);

        $this->assertTrue($result);
    }

    public function test_reorder_reorders_questions_via_repository(): void
    {
        $items = [
            ['id' => 1, 'sort_order' => 2],
            ['id' => 2, 'sort_order' => 1],
            ['id' => 3, 'sort_order' => 3],
        ];

        $this->repository
            ->expects($this->once())
            ->method('reorder')
            ->with($items);

        $this->service->reorder($items);
    }

    public function test_validate_options_allows_short_answer_without_options(): void
    {
        // Use reflection to test private method
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('validateOptions');
        $method->setAccessible(true);

        // Should not throw exception for short answer with no options
        $method->invoke($this->service, QuizQuestionType::SHORT_ANSWER, []);

        $this->assertTrue(true); // Assert test completed without exception
    }

    public function test_validate_options_requires_minimum_options_for_multiple_choice(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('validateOptions');
        $method->setAccessible(true);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Multiple choice questions must have at least 2 options');

        $options = [
            ['option_text' => 'Only one option', 'is_correct' => true],
        ];

        $method->invoke($this->service, QuizQuestionType::MULTIPLE_CHOICE, $options);
    }
}
