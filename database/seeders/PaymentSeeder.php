<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Backwards-compatible wrapper for the finance demo seeder.
 */
class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(FinanceSeeder::class);
    }
}
