<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\TeacherAnalyticsController;
use App\Http\Controllers\TeachingController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'can:teach'])->prefix('teaching')->name('teaching.')->group(function () {

    // Dashboard and course management
    Route::controller(TeachingController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->middleware('throttle:course-creation')->name('store');
        Route::get('/{id}/edit', 'edit')->name('edit');
        Route::patch('/{course}', 'update')->name('update');
        Route::delete('/{course}', 'destroy')->name('destroy');
        Route::post('/{course}/submit', 'submitForReview')->name('submit');
        Route::post('/{course}/archive', 'archive')->name('archive');
        Route::post('/{course}/restore', 'restore')->name('restore');

        // Module management
        Route::post('/{course}/modules', 'storeModule')->name('modules.store');
        Route::patch('/{course}/modules/{module}', 'updateModule')->name('modules.update');
        Route::delete('/{course}/modules/{module}', 'destroyModule')->name('modules.destroy');
        Route::patch('/{course}/modules/reorder', 'reorderModules')->name('modules.reorder');

        // Lesson management
        Route::get('/{courseId}/module/{moduleId}/lesson/{lessonId}', 'editLesson')->name('lesson.edit');
        Route::post('/{course}/modules/{module}/lessons', 'storeLesson')->name('lessons.store');
        Route::patch('/{course}/modules/{module}/lessons/{lesson}', 'updateLesson')->name('lessons.update');
        Route::delete('/{course}/modules/{module}/lessons/{lesson}', 'destroyLesson')->name('lessons.destroy');
        Route::patch('/{course}/modules/{module}/lessons/reorder', 'reorderLessons')->name('lessons.reorder');
    });

    // Quiz management (teacher)
    Route::prefix('lessons/{lessonId}/quiz')->name('quiz.')->controller(QuizController::class)->group(function () {
        Route::get('/', 'show')->name('show');
        Route::post('/', 'store')->name('store');
    });

    Route::prefix('quizzes/{quiz}')->name('quiz.')->controller(QuizController::class)->group(function () {
        Route::patch('/', 'update')->name('update');
        Route::delete('/', 'destroy')->name('destroy');
        Route::post('/publish', 'publish')->name('publish');
        Route::post('/unpublish', 'unpublish')->name('unpublish');
        Route::post('/questions', 'storeQuestion')->name('questions.store');
        Route::post('/reorder', 'reorderQuestions')->name('reorder');
        Route::get('/stats', 'stats')->name('stats');
    });

    Route::prefix('questions/{question}')->name('quiz.questions.')->controller(QuizController::class)->group(function () {
        Route::patch('/', 'updateQuestion')->name('update');
        Route::delete('/', 'destroyQuestion')->name('destroy');
    });

    // Article management (teacher)
    Route::prefix('lessons/{lessonId}/article')->name('article.')->controller(ArticleController::class)->group(function () {
        Route::get('/', 'show')->name('show');
        Route::post('/', 'upsert')->name('upsert');
        Route::delete('/', 'destroy')->name('destroy');
    });

    // Video management (teacher)
    Route::prefix('lessons/{lessonId}/video')->name('video.')->controller(VideoController::class)->group(function () {
        Route::get('/', 'show')->name('show');
        Route::get('/status', 'status')->name('status');
        Route::post('/', 'store')->middleware('throttle:10,1')->name('store');
        Route::delete('/', 'destroy')->name('destroy');
        Route::post('/retry', 'retry')->name('retry');

        // Caption management
        Route::get('/captions', 'captions')->name('captions.index');
        Route::post('/captions', 'storeCaption')->name('captions.store');
        Route::delete('/captions/{captionId}', 'destroyCaption')->name('captions.destroy');
    });

    // Teacher Forum Inbox
    Route::prefix('forum')->name('forum.')->controller(ForumController::class)->group(function () {
        Route::get('/inbox', 'teacherInbox')->name('inbox');
        Route::post('/threads/{threadId}/pin', 'pin')->name('threads.pin');
        Route::post('/threads/{threadId}/unpin', 'unpin')->name('threads.unpin');
        Route::post('/threads/{threadId}/lock', 'lock')->name('threads.lock');
        Route::post('/threads/{threadId}/unlock', 'unlock')->name('threads.unlock');
        Route::post('/replies/{replyId}/answer', 'markAnswer')->name('replies.answer');
    });

    // Teacher Analytics Dashboard (Sprint 6)
    Route::prefix('analytics')->name('analytics.')->controller(TeacherAnalyticsController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/kpis', 'kpis')->name('kpis');
        Route::get('/enrollment-chart', 'enrollmentChart')->name('enrollment-chart');
        Route::get('/revenue-chart', 'revenueChart')->name('revenue-chart');
        Route::get('/courses/{course}/students', 'students')->name('students');
        Route::get('/courses/{course}/funnel', 'funnel')->name('funnel');
        Route::get('/earnings', 'earnings')->name('earnings');
        Route::get('/earnings/export', 'exportEarnings')->name('earnings.export');
    });
});
