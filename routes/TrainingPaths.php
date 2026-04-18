<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\TrainingPathController;
use App\Http\Controllers\TrainingPathReviewController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\TrainingUnitNoteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

// Video Streaming Routes (authenticated, for enrolled students)
Route::middleware(['auth'])->prefix('videos')->name('videos.')->controller(VideoController::class)->group(function () {
    Route::get('/{videoId}/stream', 'stream')->name('stream');
    Route::get('/{videoId}/stream/{quality}/{segment}', 'segment')->name('segment');
});

// TrainingPath & Learning Routes
// Public trainingPath browsing (guest access)
Route::controller(TrainingPathController::class)->group(function () {
    Route::get('/trainingPaths', 'index')->name('trainingPaths.index');
    Route::get('/trainingPaths/{id}', 'show')->name('trainingPaths.show');
});

// Public forum read operations (rate limited)
// Guests can view threads but cannot create/modify
Route::prefix('forum')->middleware(['throttle:forum'])->name('forum.')->controller(ForumController::class)->group(function () {
    Route::get('/trainingUnits/{trainingUnitId}/threads', 'index')->name('trainingUnit.threads');
    Route::get('/trainingPaths/{trainingPathId}/threads', 'trainingPathThreads')->name('trainingPath.threads');
    Route::get('/threads/{threadId}', 'show')->name('threads.show');
});

// Public trainingPath reviews - read only (rate limited)
// Guests can view reviews but cannot create/modify
Route::prefix('trainingPaths/{trainingPathId}/reviews')->middleware(['throttle:search'])->name('trainingPaths.reviews.')->controller(TrainingPathReviewController::class)->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/stats', 'stats')->name('stats');
});

// Search Routes (public, rate limited)
Route::prefix('search')->middleware(['throttle:search'])->name('search.')->controller(SearchController::class)->group(function () {
    Route::get('/', 'search')->name('index');
    Route::get('/suggest', 'suggest')->name('suggest');
    Route::get('/trending', 'trending')->name('trending');
    Route::get('/categories', 'categories')->name('categories');
    Route::get('/category/{slug}', 'byCategory')->name('category');
});

// Recent searches (authenticated only)
Route::middleware(['auth'])->get('/search/recent', [SearchController::class, 'recent'])->name('search.recent');

// Notifications Routes (authenticated)
Route::middleware(['auth'])->prefix('notifications')->name('notifications.')->controller(NotificationController::class)->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/recent', 'recent')->name('recent');
    Route::get('/unread-count', 'unreadCount')->name('unread-count');
    Route::post('/mark-all-read', 'markAllAsRead')->name('mark-all-read');
    Route::post('/mark-many-read', 'markManyAsRead')->name('mark-many-read');
    Route::post('/{id}/read', 'markAsRead')->name('read');
    Route::delete('/{id}', 'destroy')->name('destroy');
});

// Public certificate verification
Route::controller(CertificateController::class)->group(function () {
    Route::get('/certificates/verify/{hash}', 'verify')->name('certificates.verify');
    Route::get('/certificates/{hash}/download', 'download')->name('certificates.download');
});

// Public checkout routes (success/cancelled after Stripe redirect - no auth needed)
Route::prefix('checkout')->name('checkout.')->controller(CheckoutController::class)->group(function () {
    Route::get('/success', 'success')->name('success');
    Route::get('/cancelled', 'cancelled')->name('cancelled');
});

// Authenticated trainingPath / student routes
Route::middleware(['auth', 'verified'])->group(function () {

    // TrainingPath enrollment & tracking
    Route::controller(TrainingPathController::class)->group(function () {
        Route::get('/my-trainingPaths', 'myTrainingPaths')->name('trainingPaths.my');
        Route::get('/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}', 'trainingUnit')->name('trainingPaths.trainingUnit');

        // TrainingPath enrollment
        Route::post('/trainingPaths/{id}/enroll', 'enroll')->name('trainingPaths.enroll');
        Route::delete('/trainingPaths/{id}/enroll', 'unenroll')->name('trainingPaths.unenroll');

        // TrainingUnit progress
        Route::post('/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete', 'markTrainingUnitComplete')->name('trainingPaths.trainingUnits.complete');
        Route::delete('/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete', 'markTrainingUnitIncomplete')->name('trainingPaths.trainingUnits.incomplete');

        // Video and Article progress tracking
        Route::post('/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress', 'updateVideoProgress')->name('trainingPaths.trainingUnits.video-progress');
        Route::post('/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read', 'markArticleRead')->name('trainingPaths.trainingUnits.article-read');
        
        // Video status for students
        Route::get('/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status', [VideoController::class, 'status'])->name('trainingPaths.trainingUnits.video.status');
    });

    // TrainingUnit notes
    Route::prefix('trainingUnits/{trainingUnitId}/notes')->name('trainingUnits.notes.')->controller(TrainingUnitNoteController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{noteId}', 'update')->name('update');
        Route::delete('/{noteId}', 'destroy')->name('destroy');
    });
    Route::get('/trainingPaths/{trainingPathId}/notes', [TrainingUnitNoteController::class, 'trainingPathNotes'])->name('trainingPaths.notes');

    // TrainingPath reviews (authenticated - write operations only)
    Route::prefix('trainingPaths/{trainingPathId}/reviews')->name('trainingPaths.reviews.')->controller(TrainingPathReviewController::class)->group(function () {
        Route::get('/my', 'myReview')->name('my');
        Route::post('/', 'store')->name('store');
        Route::put('/{reviewId}', 'update')->name('update');
        Route::delete('/{reviewId}', 'destroy')->name('destroy');
    });

    // Certificates
    Route::prefix('certificates')->name('certificates.')->controller(CertificateController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/trainingPaths/{trainingPathId}', 'store')->name('store');
        Route::get('/trainingPaths/{trainingPathId}/check', 'check')->name('check');
    });

    // Discussion Forum Routes (authenticated - write operations only)
    Route::prefix('forum')->middleware(['throttle:forum'])->name('forum.')->controller(ForumController::class)->group(function () {
        // Thread creation & modification
        Route::post('/trainingUnits/{trainingUnitId}/threads', 'store')->name('threads.store');
        Route::post('/trainingPaths/{trainingPathId}/threads', 'store')->name('trainingPath.threads.store');

        // Thread & Reply operations (authenticated only)
        Route::delete('/threads/{threadId}', 'destroyThread')->name('threads.destroy');
        Route::post('/threads/{threadId}/reply', 'reply')->name('threads.reply');
        Route::post('/threads/{threadId}/upvote', 'upvoteThread')->name('threads.upvote');
        Route::post('/threads/{threadId}/flag', 'flagThread')->name('threads.flag');
        Route::post('/replies/{replyId}/upvote', 'upvoteReply')->name('replies.upvote');
        Route::post('/replies/{replyId}/flag', 'flagReply')->name('replies.flag');
        Route::delete('/replies/{replyId}', 'destroyReply')->name('replies.destroy');
    });

    // Quiz taking routes (students)
    Route::controller(QuizController::class)->group(function () {
        Route::get('/trainingUnits/{trainingUnitId}/quiz', 'take')->name('quiz.take');
        Route::post('/quizzes/{quiz}/start', 'startAttempt')->name('quiz.start');
        Route::post('/quiz-attempts/{attempt}/submit', 'submitAttempt')->name('quiz.submit');
        Route::get('/quizzes/{quiz}/history', 'attemptHistory')->name('quiz.history');
        Route::get('/quiz-attempts/{attempt}', 'showAttempt')->name('quiz.attempt');
    });

    Route::get('/trainingUnits/{trainingUnitId}/article/read', [ArticleController::class, 'read'])->name('article.read');

    // Checkout & Payments (authenticated routes only)
    Route::prefix('checkout')->name('checkout.')->controller(CheckoutController::class)->group(function () {
        Route::post('/initiate', 'checkout')->middleware('throttle:5,1')->name('initiate');
        Route::get('/payments', 'payments')->name('payments');
        Route::post('/refund', 'requestRefund')->middleware('throttle:3,1')->name('refund.request');
        Route::get('/refunds', 'refunds')->name('refunds');
    });
});
