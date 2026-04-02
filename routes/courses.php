<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseReviewController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\LessonNoteController;
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

// Course & Learning Routes
// Public course browsing (guest access)
Route::controller(CourseController::class)->group(function () {
    Route::get('/courses', 'index')->name('courses.index');
    Route::get('/courses/{id}', 'show')->name('courses.show');
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

// Authenticated course / student routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Course enrollment & tracking
    Route::controller(CourseController::class)->group(function () {
        Route::get('/my-courses', 'myCourses')->name('courses.my');
        Route::get('/courses/{courseId}/lesson/{lessonId}', 'lesson')->name('courses.lesson');

        // Course enrollment
        Route::post('/courses/{id}/enroll', 'enroll')->name('courses.enroll');
        Route::delete('/courses/{id}/enroll', 'unenroll')->name('courses.unenroll');

        // Lesson progress
        Route::post('/courses/{courseId}/lessons/{lessonId}/complete', 'markLessonComplete')->name('courses.lessons.complete');
        Route::delete('/courses/{courseId}/lessons/{lessonId}/complete', 'markLessonIncomplete')->name('courses.lessons.incomplete');

        // Video and Article progress tracking
        Route::post('/courses/{courseId}/lessons/{lessonId}/video-progress', 'updateVideoProgress')->name('courses.lessons.video-progress');
        Route::post('/courses/{courseId}/lessons/{lessonId}/article-read', 'markArticleRead')->name('courses.lessons.article-read');
        
        // Video status for students
        Route::get('/courses/{courseId}/lessons/{lessonId}/video/status', [VideoController::class, 'status'])->name('courses.lessons.video.status');
    });

    // Lesson notes
    Route::prefix('lessons/{lessonId}/notes')->name('lessons.notes.')->controller(LessonNoteController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{noteId}', 'update')->name('update');
        Route::delete('/{noteId}', 'destroy')->name('destroy');
    });
    Route::get('/courses/{courseId}/notes', [LessonNoteController::class, 'courseNotes'])->name('courses.notes');

    // Course reviews
    Route::prefix('courses/{courseId}/reviews')->name('courses.reviews.')->controller(CourseReviewController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/stats', 'stats')->name('stats');
        Route::get('/my', 'myReview')->name('my');
        Route::post('/', 'store')->name('store');
        Route::put('/{reviewId}', 'update')->name('update');
        Route::delete('/{reviewId}', 'destroy')->name('destroy');
    });

    // Certificates
    Route::prefix('certificates')->name('certificates.')->controller(CertificateController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/courses/{courseId}', 'store')->name('store');
        Route::get('/courses/{courseId}/check', 'check')->name('check');
    });

    // Discussion Forum Routes (rate limited)
    Route::prefix('forum')->middleware(['throttle:forum'])->name('forum.')->controller(ForumController::class)->group(function () {
        // Lesson & Course threads
        Route::get('/lessons/{lessonId}/threads', 'index')->name('lesson.threads');
        Route::post('/lessons/{lessonId}/threads', 'store')->name('threads.store');
        Route::get('/courses/{courseId}/threads', 'courseThreads')->name('course.threads');

        // Thread & Reply operations
        Route::get('/threads/{threadId}', 'show')->name('threads.show');
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
        Route::get('/lessons/{lessonId}/quiz', 'take')->name('quiz.take');
        Route::post('/quizzes/{quiz}/start', 'startAttempt')->name('quiz.start');
        Route::post('/quiz-attempts/{attempt}/submit', 'submitAttempt')->name('quiz.submit');
        Route::get('/quizzes/{quiz}/history', 'attemptHistory')->name('quiz.history');
        Route::get('/quiz-attempts/{attempt}', 'showAttempt')->name('quiz.attempt');
    });

    Route::get('/lessons/{lessonId}/article/read', [ArticleController::class, 'read'])->name('article.read');

    // Checkout & Payments (authenticated routes only)
    Route::prefix('checkout')->name('checkout.')->controller(CheckoutController::class)->group(function () {
        Route::post('/initiate', 'checkout')->middleware('throttle:5,1')->name('initiate');
        Route::get('/payments', 'payments')->name('payments');
        Route::post('/refund', 'requestRefund')->middleware('throttle:3,1')->name('refund.request');
        Route::get('/refunds', 'refunds')->name('refunds');
    });
});
