<?php

namespace Tests\Feature\Seeders;

use App\Enums\PayoutStatus;
use App\Enums\RefundStatus;
use App\Models\PayoutRequest;
use App\Models\RefundRequest;
use Database\Seeders\FinanceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_finance_seeder_creates_all_payout_and_refund_statuses(): void
    {
        $this->seed(FinanceSeeder::class);

        foreach (PayoutStatus::cases() as $status) {
            $this->assertDatabaseHas('payout_requests', ['status' => $status->value]);
            $this->assertTrue(PayoutRequest::where('status', $status)->exists());
        }

        foreach (RefundStatus::cases() as $status) {
            $this->assertDatabaseHas('refund_requests', ['status' => $status->value]);
            $this->assertTrue(RefundRequest::where('status', $status)->exists());
        }
    }
}