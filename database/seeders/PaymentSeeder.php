<?php

namespace Database\Seeders;

use App\Enums\PaymentStatus;
use App\Enums\PayoutStatus;
use App\Enums\RefundStatus;
use App\Models\Payment;
use App\Models\PayoutRequest;
use App\Models\RefundRequest;
use App\Models\TrainingPath;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds payments, refund requests, and payout requests.
 */
class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $engineers = User::where('role', 'engineer')->get();
        $teachers = User::where('role', 'teacher')->get();
        $trainingPaths = TrainingPath::all();

        if ($engineers->isEmpty() || $trainingPaths->isEmpty()) {
            $this->command->warn('No engineers or trainingPaths found. Skipping payments.');

            return;
        }

        // ── Create payments for engineer trainingPath purchases with ALL statuses ──
        $paymentStatuses = [
            PaymentStatus::COMPLETED,
            PaymentStatus::PENDING,
            PaymentStatus::FAILED,
            PaymentStatus::REFUNDED,
            PaymentStatus::PARTIALLY_REFUNDED,
        ];

        foreach ($engineers as $engineer) {
            foreach ($trainingPaths->random(min(5, count($trainingPaths))) as $trainingPath) {
                // Ensure each engineer gets each payment status variation
                foreach ($paymentStatuses as $status) {
                    Payment::create([
                        'user_id' => $engineer->id,
                        'training_path_id' => $trainingPath->id,
                        'amount_cents' => rand(9900, 49900),
                        'currency' => 'USD',
                        'status' => $status,
                        'stripe_session_id' => 'sess_'.uniqid(),
                        'stripe_payment_intent_id' => $status === PaymentStatus::FAILED ? null : ('pi_'.uniqid()),
                        'paid_at' => $status === PaymentStatus::COMPLETED ? now()->subDays(rand(1, 60)) : null,
                        'metadata' => json_encode([
                            'source' => ['website', 'mobile_app', 'admin_panel'][array_rand([0, 1, 2])],
                            'device' => ['desktop', 'mobile', 'tablet'][array_rand([0, 1, 2])],
                        ]),
                    ]);
                }
            }
        }

        // ── Create refund requests with ALL statuses ──
        $refundStatuses = [
            RefundStatus::PENDING,
            RefundStatus::APPROVED,
            RefundStatus::REJECTED,
            RefundStatus::PROCESSING,
            RefundStatus::COMPLETED,
            RefundStatus::FAILED,
        ];

        $completedPayments = Payment::where('status', PaymentStatus::COMPLETED)
            ->inRandomOrder()
            ->limit(min(12, Payment::count()))
            ->get();

        $reasons = [
            'TrainingPath did not meet expectations',
            'Technical issues prevented access',
            'Changed my mind',
            'Found alternative trainingPath',
            'Unable to complete due to time constraints',
            'Duplicate purchase',
            'Quality of content was poor',
            'Instructor was not responsive',
        ];

        foreach ($completedPayments as $payment) {
            foreach ($refundStatuses as $status) {
                RefundRequest::create([
                    'user_id' => $payment->user_id,
                    'payment_id' => $payment->id,
                    'reason' => $reasons[array_rand($reasons)],
                    'status' => $status,
                    'processed_at' => in_array($status, [RefundStatus::APPROVED, RefundStatus::REJECTED, RefundStatus::COMPLETED, RefundStatus::FAILED])
                        ? now()->subDays(rand(0, 10))
                        : null,
                    'refund_amount_cents' => in_array($status, [RefundStatus::APPROVED, RefundStatus::COMPLETED]) ? $payment->amount_cents : null,
                    'admin_notes' => $status === RefundStatus::REJECTED ? 'Outside refund window' : null,
                ]);
            }
        }

        // ── Create payout requests with ALL statuses ──
        $payoutStatuses = [
            PayoutStatus::PENDING,
            PayoutStatus::APPROVED,
            PayoutStatus::REJECTED,
            PayoutStatus::COMPLETED,
        ];

        foreach ($teachers as $teacher) {
            foreach ($payoutStatuses as $status) {
                PayoutRequest::create([
                    'user_id' => $teacher->id,
                    'amount_cents' => rand(50000, 500000),
                    'currency' => 'USD',
                    'status' => $status,
                    'payout_method' => ['bank_transfer', 'paypal', 'stripe'][array_rand([0, 1, 2])],
                    'approved_at' => in_array($status, ['approved', 'processing', 'completed']) ? now()->subDays(rand(1, 30)) : null,
                    'completed_at' => $status === 'completed' ? now()->subDays(rand(0, 10)) : null,
                    'admin_notes' => $status === 'rejected' ? 'Insufficient account verification' : null,
                ]);
            }
        }

        $this->command->info('Seeded payments with all statuses.');
    }
}
