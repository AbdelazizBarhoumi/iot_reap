<?php

namespace App\Repositories;

use App\Enums\RefundStatus;
use App\Models\RefundRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class RefundRepository
{
    public function __construct(
        protected RefundRequest $model
    ) {}

    public function create(array $data): RefundRequest
    {
        return $this->model->create($data);
    }

    public function findById(int $id): ?RefundRequest
    {
        return $this->model
            ->with(['payment.trainingPath', 'user'])
            ->find($id);
    }

    public function getPending(): Collection
    {
        return $this->model
            ->where('status', RefundStatus::PENDING)
            ->with(['payment.trainingPath', 'payment.user', 'user'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function getPendingPaginated(int $perPage = 20): LengthAwarePaginator
    {
        return $this->model
            ->where('status', RefundStatus::PENDING)
            ->with(['payment.trainingPath', 'payment.user', 'user'])
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
    }

    public function getByUser(User $user): Collection
    {
        return $this->model
            ->where('user_id', $user->id)
            ->with(['payment.trainingPath'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function hasPendingForPayment(int $paymentId): bool
    {
        return $this->model
            ->where('payment_id', $paymentId)
            ->whereIn('status', [
                RefundStatus::PENDING,
                RefundStatus::APPROVED,
                RefundStatus::PROCESSING,
            ])
            ->exists();
    }

    public function update(RefundRequest $refund, array $data): RefundRequest
    {
        $refund->update($data);

        return $refund->fresh();
    }
}
