<?php

namespace App\Support\Database;

use Illuminate\Support\Facades\DB;

/**
 * Manages database transactions safely, handling SQLite's nested transaction limitations.
 *
 * When tests use RefreshDatabase, they wrap test execution in a transaction.
 * If application code tries to start another transaction, SQLite fails.
 * This wrapper detects when we're already in a transaction and executes without nesting.
 */
class TransactionManager
{
    /**
     * Execute a callback within a database transaction, safely handling nesting.
     *
     * @template T
     *
     * @param  callable(): T  $callback
     * @param  string|null  $connection  Connection name
     * @return T
     */
    public static function execute(callable $callback, ?string $connection = null): mixed
    {
        $conn = DB::connection($connection);

        // Check if transaction counter > 0 using reflection
        // Laravel stores this in the $transactions property
        $transactionsProp = (new \ReflectionClass($conn))->getProperty('transactions');
        $transactionsProp->setAccessible(true);
        $transactions = $transactionsProp->getValue($conn) ?? 0;

        // If already in a transaction, skip nesting (just execute the callback)
        if ($transactions > 0) {
            return $callback();
        }

        // Otherwise, start a new transaction
        return $conn->transaction($callback);
    }
}
