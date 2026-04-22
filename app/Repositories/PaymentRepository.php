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

    public function findCompletedByUserAndTrainingPath(string $userId, int $trainingPathId): ?Payment
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('training_path_id', $trainingPathId)
            ->where('status', PaymentStatus::COMPLETED)
            ->first();
    }

    public function getByUser(User $user): Collection
    {
        return $this->model
            ->where('user_id', $user->id)
            ->with('trainingPath')
            ->latest()
            ->get();
    }

    public function getRevenueByTeacher(int|string $teacherId): int
    {
        return (int) $this->model
            ->join('training_paths', 'payments.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacherId)
            ->where('payments.status', PaymentStatus::COMPLETED)
            ->sum('payments.amount_cents');
    }

    public function getRevenueByDateRange(int|string $teacherId, string $startDate, string $endDate): Collection
    {
        return $this->model
            ->selectRaw('DATE(paid_at) as date, SUM(amount_cents) as revenue_cents, COUNT(*) as sales_count')
            ->join('training_paths', 'payments.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacherId)
            ->where('payments.status', PaymentStatus::COMPLETED->value)
            ->whereBetween(DB::raw('DATE(paid_at)'), [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }
}
