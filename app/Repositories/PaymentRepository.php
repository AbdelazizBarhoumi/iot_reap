<?php

namespace App\Repositories;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PaymentRepository
{
    public function __construct(
        protected Payment $model
    ) {}

    public function create(array $data): Payment
    {
        return $this->model->create($data);
    }

    /**
     * @deprecated Unused - route model binding handles this. Candidate for removal.
     */
    public function findById(int $id): ?Payment
    {
        return $this->model->find($id);
    }

    public function findByStripeSessionId(string $sessionId): ?Payment
    {
        return $this->model
            ->where('stripe_session_id', $sessionId)
            ->first();
    }

    public function findByStripePaymentIntentId(string $paymentIntentId): ?Payment
    {
        return $this->model
            ->where('stripe_payment_intent_id', $paymentIntentId)
            ->first();
    }

    public function findCompletedByUserAndCourse(string $userId, int $courseId): ?Payment
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('status', PaymentStatus::COMPLETED)
            ->first();
    }

    /**
     * @deprecated Unused - no user payment history feature. Candidate for removal.
     */
    public function getByUser(User $user): Collection
    {
        return $this->model
            ->where('user_id', $user->id)
            ->with(['course'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * @deprecated Unused - no user payment history feature. Candidate for removal.
     */
    public function getByUserCompleted(User $user): Collection
    {
        return $this->model
            ->where('user_id', $user->id)
            ->where('status', PaymentStatus::COMPLETED)
            ->with(['course'])
            ->orderBy('paid_at', 'desc')
            ->get();
    }

    /**
     * @deprecated Unused - no course payment list feature. Candidate for removal.
     */
    public function getByCourse(int $courseId): Collection
    {
        return $this->model
            ->where('course_id', $courseId)
            ->where('status', PaymentStatus::COMPLETED)
            ->with(['user'])
            ->orderBy('paid_at', 'desc')
            ->get();
    }

    /**
     * @deprecated Unused - RevenueService uses direct DB queries. Candidate for removal.
     */
    public function getRevenueByCourse(int $courseId): int
    {
        return (int) $this->model
            ->where('course_id', $courseId)
            ->where('status', PaymentStatus::COMPLETED)
            ->sum('amount_cents');
    }

    public function getRevenueByTeacher(int|string $teacherId): int
    {
        return (int) $this->model
            ->join('courses', 'payments.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacherId)
            ->where('payments.status', PaymentStatus::COMPLETED)
            ->sum('payments.amount_cents');
    }

    public function getRevenueByDateRange(int|string $teacherId, string $startDate, string $endDate): Collection
    {
        return $this->model
            ->selectRaw('DATE(paid_at) as date, SUM(amount_cents) as revenue_cents, COUNT(*) as sales_count')
            ->join('courses', 'payments.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacherId)
            ->where('payments.status', PaymentStatus::COMPLETED->value)
            ->whereBetween(DB::raw('DATE(paid_at)'), [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    /**
     * @deprecated Unused - webhook service updates payments directly. Candidate for removal.
     */
    public function update(Payment $payment, array $data): Payment
    {
        $payment->update($data);

        return $payment->fresh();
    }
}
