<?php

namespace App\Support;

use NumberFormatter;

class CurrencyFormatter
{
    /**
     * Format a decimal currency amount for display.
     */
    public static function format(float $amount, ?string $currency = 'USD', string $locale = 'en_US'): string
    {
        $currency = strtoupper($currency ?: 'USD');

        if (class_exists(NumberFormatter::class)) {
            $formatter = new NumberFormatter($locale, NumberFormatter::CURRENCY);
            $formatted = $formatter->formatCurrency($amount, $currency);

            if ($formatted !== false) {
                return $formatted;
            }
        }

        $symbol = match ($currency) {
            'USD' => '$',
            'EUR' => 'EUR ',
            'GBP' => 'GBP ',
            'NGN' => 'NGN ',
            default => $currency.' ',
        };

        return $symbol.number_format($amount, 2);
    }
}
