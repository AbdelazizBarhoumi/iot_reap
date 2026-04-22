<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\TeacherAnalyticsController;
use App\Http\Controllers\TeachingController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\TeacherPayoutController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'can:teach'])->prefix('teaching')->name('teaching.')->group(function () {

    // Dashboard and trainingPath management
    Route::controller(TeachingController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->middleware('throttle:trainingPath-creation')->name('store');
        Route::get('/{id}/edit', 'edit')->name('edit');
        Route::patch('/{trainingPath}', 'update')->name('update');
        Route::delete('/{trainingPath}', 'destroy')->name('destroy');
        Route::post('/{trainingPath}/submit', 'submitForReview')->name('submit');
        Route::post('/{trainingPath}/archive', 'archive')->name('archive');
        Route::post('/{trainingPath}/restore', 'restore')->name('restore');

        // Module management
        Route::post('/{trainingPath}/modules', 'storeModule')->name('modules.store');
        Route::patch('/{trainingPath}/modules/{module}', 'updateModule')->name('modules.update');
        Route::delete('/{trainingPath}/modules/{module}', 'destroyModule')->name('modules.destroy');
        Route::patch('/{trainingPath}/modules/reorder', 'reorderModules')->name('modules.reorder');

        // TrainingUnit management
        Route::get('/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}', 'editTrainingUnit')->name('trainingUnit.edit');
        Route::post('/{trainingPath}/modules/{module}/trainingUnits', 'storeTrainingUnit')->name('trainingUnits.store');
        Route::patch('/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}', 'updateTrainingUnit')->name('trainingUnits.update');
        Route::delete('/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}', 'destroyTrainingUnit')->name('trainingUnits.destroy');
        Route::patch('/{trainingPath}/modules/{module}/trainingUnits/reorder', 'reorderTrainingUnits')->name('trainingUnits.reorder');
    });

    // Quiz management (teacher)
    Route::prefix('trainingUnits/{trainingUnitId}/quiz')->name('quiz.')->controller(QuizController::class)->group(function () {
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
    Route::prefix('trainingUnits/{trainingUnitId}/article')->name('article.')->controller(ArticleController::class)->group(function () {
        Route::get('/', 'show')->name('show');
        Route::post('/', 'upsert')->name('upsert');
        Route::delete('/', 'destroy')->name('destroy');
    });

    // Video management (teacher)
    Route::prefix('trainingUnits/{trainingUnitId}/video')->name('video.')->controller(VideoController::class)->group(function () {
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
        Route::get('/trainingPaths/{trainingPath}/students', 'students')->name('students');
        Route::get('/trainingPaths/{trainingPath}/funnel', 'funnel')->name('funnel');
        Route::get('/earnings', 'earnings')->name('earnings');
        Route::get('/earnings/export', 'exportEarnings')->name('earnings.export');
    });

    // Teacher payout self-service
    Route::prefix('payouts')->name('payouts.')->controller(TeacherPayoutController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/request', 'store')->name('request');
    });

    // TrainingUnit VM Assignments (teacher submission)
    Route::prefix('trainingUnit-assignments')->name('trainingUnit-assignments.')->controller(\App\Http\Controllers\TrainingUnitVMAssignmentController::class)->group(function () {
        Route::get('/available-vms', 'availableVMs')->name('available-vms');
        Route::post('/', 'store')->name('store');
        Route::get('/my-assignments', 'myAssignments')->name('my');
        Route::delete('/{assignment}', 'destroy')->name('destroy');
    });

    // Get assignment for a trainingUnit (to check if VM is enabled)
    Route::get('/trainingUnits/{trainingUnitId}/vm-assignment', [\App\Http\Controllers\TrainingUnitVMAssignmentController::class, 'forTrainingUnit'])->name('trainingUnit.vm-assignment');
});
