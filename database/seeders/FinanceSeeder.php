<?php

namespace Database\Seeders;

use App\Enums\PaymentStatus;
use App\Enums\PayoutStatus;
use App\Enums\RefundStatus;
use App\Enums\UserRole;
use App\Models\Payment;
use App\Models\PayoutRequest;
use App\Models\RefundRequest;
use App\Models\TrainingPath;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = $this->ensureUser('finance.admin@example.com', 'Finance Admin', UserRole::ADMIN->value);
        $teachers = $this->ensureUsers(UserRole::TEACHER->value, [
            ['email' => 'finance.teacher1@example.com', 'name' => 'Finance Teacher 1'],
            ['email' => 'finance.teacher2@example.com', 'name' => 'Finance Teacher 2'],
        ]);
        $students = $this->ensureUsers(UserRole::ENGINEER->value, [
            ['email' => 'finance.engineer1@example.com', 'name' => 'Finance Engineer 1'],
            ['email' => 'finance.engineer2@example.com', 'name' => 'Finance Engineer 2'],
        ]);

        $trainingPaths = $this->ensureTrainingPaths($teachers);
        $completedPayments = $this->seedPayments($students, $trainingPaths);

        $this->seedRefundRequests($completedPayments);
        $this->seedPayoutRequests($admin, $teachers);

        $this->command->info('✅ Finance demo data seeded with payout and refund samples.');
    }

    private function ensureUser(string $email, string $name, string $role): User
    {
        return User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => bcrypt('password'),
                'role' => $role,
                'email_verified_at' => now(),
            ],
        );
    }

    /**
     * @return Collection<int, User>
     */
    private function ensureUsers(string $role, array $seedUsers): Collection
    {
        $users = User::where('role', $role)->get();

        foreach ($seedUsers as $seedUser) {
            $users->push(User::firstOrCreate(
                ['email' => $seedUser['email']],
                [
                    'name' => $seedUser['name'],
                    'password' => bcrypt('password'),
                    'role' => $role,
                    'email_verified_at' => now(),
                ],
            ));
        }

        return $users->unique('id')->values();
    }

    /**
     * @param  Collection<int, User>  $teachers
     * @return Collection<int, TrainingPath>
     */
    private function ensureTrainingPaths(Collection $teachers): Collection
    {
        $trainingPaths = TrainingPath::query()->get();

        if ($trainingPaths->count() >= 3) {
            return $trainingPaths;
        }

        $templates = [
            [
                'title' => 'Finance Demo: Industrial Safety Refresher',
                'category' => 'Safety',
            ],
            [
                'title' => 'Finance Demo: PLC Troubleshooting Basics',
                'category' => 'Automation',
            ],
            [
                'title' => 'Finance Demo: Edge Gateway Maintenance',
                'category' => 'Industrial IoT',
            ],
        ];

        foreach ($templates as $index => $template) {
            $trainingPaths->push(
                TrainingPath::factory()
                    ->approved()
                    ->forInstructor($teachers[$index % $teachers->count()])
                    ->create([
                        'title' => $template['title'],
                        'description' => 'Seeded finance demo course for payout and refund workflows.',
                        'category' => $template['category'],
                        'has_virtual_machine' => $index !== 0,
                    ])
            );
        }

        return $trainingPaths->unique('id')->values();
    }

    /**
     * @param  Collection<int, User>  $students
     * @param  Collection<int, TrainingPath>  $trainingPaths
     * @return Collection<int, Payment>
     */
    private function seedPayments(Collection $students, Collection $trainingPaths): Collection
    {
        $completedPayments = collect();
        $paymentStatuses = [
            PaymentStatus::COMPLETED,
            PaymentStatus::PENDING,
            PaymentStatus::FAILED,
            PaymentStatus::REFUNDED,
            PaymentStatus::PARTIALLY_REFUNDED,
        ];

        foreach ($students as $studentIndex => $student) {
            foreach ($paymentStatuses as $statusIndex => $status) {
                $trainingPath = $trainingPaths[($studentIndex + $statusIndex) % $trainingPaths->count()];

                $payment = Payment::factory()
                    ->forUser($student)
                    ->forTrainingPath($trainingPath)
                    ->state([
                        'status' => $status,
                        'amount_cents' => 4900 + ($statusIndex * 1000),
                        'metadata' => [
                            'source' => 'finance-demo-seeder',
                            'seed_type' => 'payment',
                        ],
                        'stripe_payment_intent_id' => $status === PaymentStatus::FAILED ? null : 'pi_demo_'.uniqid(),
                        'paid_at' => in_array($status, [PaymentStatus::COMPLETED, PaymentStatus::REFUNDED, PaymentStatus::PARTIALLY_REFUNDED], true)
                            ? now()->subDays(7 + $statusIndex)
                            : null,
                    ])
                    ->create();

                if ($status === PaymentStatus::COMPLETED) {
                    $completedPayments->push($payment);
                }
            }
        }

        if ($completedPayments->isEmpty()) {
            $completedPayments->push(
                Payment::factory()
                    ->forUser($students->first())
                    ->forTrainingPath($trainingPaths->first())
                    ->completed()
                    ->create()
            );
        }

        return $completedPayments;
    }

    /**
     * @param  Collection<int, Payment>  $completedPayments
     */
    private function seedRefundRequests(Collection $completedPayments): void
    {
        $statuses = [
            RefundStatus::PENDING,
            RefundStatus::APPROVED,
            RefundStatus::REJECTED,
            RefundStatus::PROCESSING,
            RefundStatus::COMPLETED,
            RefundStatus::FAILED,
        ];

        $reasons = [
            'Changed my learning plan',
            'Course content did not match expectations',
            'Technical issue prevented access',
            'Duplicate payment made by mistake',
            'No longer need the course',
            'Requested within the refund window',
        ];

        foreach ($statuses as $index => $status) {
            $payment = $completedPayments[$index % $completedPayments->count()];

            RefundRequest::create([
                'payment_id' => $payment->id,
                'user_id' => $payment->user_id,
                'status' => $status,
                'reason' => $reasons[$index % count($reasons)],
                'admin_notes' => match ($status) {
                    RefundStatus::REJECTED => 'Outside the refund window.',
                    RefundStatus::FAILED => 'Stripe refund failed during processing.',
                    RefundStatus::APPROVED => 'Approved for processing.',
                    default => null,
                },
                'stripe_refund_id' => $status === RefundStatus::COMPLETED ? 're_demo_'.uniqid() : null,
                'refund_amount_cents' => in_array($status, [RefundStatus::APPROVED, RefundStatus::COMPLETED], true)
                    ? $payment->amount_cents
                    : null,
                'processed_at' => in_array($status, [RefundStatus::APPROVED, RefundStatus::REJECTED, RefundStatus::PROCESSING, RefundStatus::COMPLETED, RefundStatus::FAILED], true)
                    ? now()->subDays($index + 1)
                    : null,
            ]);
        }

        RefundRequest::create([
            'payment_id' => $completedPayments->first()->id,
            'user_id' => $completedPayments->first()->user_id,
            'status' => RefundStatus::COMPLETED,
            'reason' => 'Finance demo happy-path refund',
            'admin_notes' => 'Completed by seeded Stripe flow.',
            'stripe_refund_id' => 're_demo_'.uniqid(),
            'refund_amount_cents' => $completedPayments->first()->amount_cents,
            'processed_at' => now()->subHours(8),
        ]);
    }

    /**
     * @param  Collection<int, User>  $teachers
     */
    private function seedPayoutRequests(User $admin, Collection $teachers): void
    {
        $statuses = [
            PayoutStatus::PENDING,
            PayoutStatus::APPROVED,
            PayoutStatus::PROCESSING,
            PayoutStatus::COMPLETED,
            PayoutStatus::REJECTED,
            PayoutStatus::FAILED,
        ];

        foreach ($teachers as $teacherIndex => $teacher) {
            foreach ($statuses as $statusIndex => $status) {
                PayoutRequest::create([
                    'user_id' => $teacher->id,
                    'amount_cents' => 50000 + ($teacherIndex * 10000) + ($statusIndex * 2500),
                    'currency' => 'USD',
                    'status' => $status,
                    'payout_method' => ['stripe', 'bank_transfer', 'paypal'][($teacherIndex + $statusIndex) % 3],
                    'payout_details' => [
                        'reference' => 'finance-demo-'.($teacherIndex + 1).'-'.($statusIndex + 1),
                    ],
                    'stripe_transfer_id' => in_array($status, [PayoutStatus::PROCESSING, PayoutStatus::COMPLETED], true)
                        ? 'tr_demo_'.uniqid()
                        : null,
                    'approved_by' => in_array($status, [PayoutStatus::APPROVED, PayoutStatus::PROCESSING, PayoutStatus::COMPLETED, PayoutStatus::REJECTED, PayoutStatus::FAILED], true)
                        ? $admin->id
                        : null,
                    'approved_at' => in_array($status, [PayoutStatus::APPROVED, PayoutStatus::PROCESSING, PayoutStatus::COMPLETED, PayoutStatus::REJECTED, PayoutStatus::FAILED], true)
                        ? now()->subDays($statusIndex + 1)
                        : null,
                    'processed_at' => in_array($status, [PayoutStatus::PROCESSING, PayoutStatus::COMPLETED, PayoutStatus::FAILED], true)
                        ? now()->subDays($statusIndex)
                        : null,
                    'completed_at' => $status === PayoutStatus::COMPLETED
                        ? now()->subDays($statusIndex)
                        : null,
                    'admin_notes' => match ($status) {
                        PayoutStatus::REJECTED => 'Insufficient account verification.',
                        PayoutStatus::FAILED => 'Payment processor returned an error.',
                        default => null,
                    },
                    'rejection_reason' => $status === PayoutStatus::REJECTED
                        ? 'Bank details need verification.'
                        : null,
                ]);
            }
        }
    }
}