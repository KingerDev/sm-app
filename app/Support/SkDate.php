<?php

namespace App\Support;

use Carbon\Carbon;

class SkDate
{
    public const MONTHS = [
        1 => 'január', 'február', 'marec', 'apríl', 'máj', 'jún',
        'júl', 'august', 'september', 'október', 'november', 'december',
    ];

    public const MONTHS_SHORT = [
        1 => 'jan', 'feb', 'mar', 'apr', 'máj', 'jún',
        'júl', 'aug', 'sep', 'okt', 'nov', 'dec',
    ];

    /** "21. január 2026" alebo "12. – 14. apríl 2026" alebo "28. apríl – 2. máj 2026" */
    public static function display(Carbon $start, ?Carbon $end = null): string
    {
        if (! $end || $start->isSameDay($end)) {
            return sprintf('%d. %s %d', $start->day, self::MONTHS[$start->month], $start->year);
        }

        if ($start->month === $end->month && $start->year === $end->year) {
            return sprintf('%d. – %d. %s %d', $start->day, $end->day, self::MONTHS[$end->month], $end->year);
        }

        if ($start->year === $end->year) {
            return sprintf(
                '%d. %s – %d. %s %d',
                $start->day, self::MONTHS[$start->month],
                $end->day, self::MONTHS[$end->month], $end->year
            );
        }

        return sprintf(
            '%d. %s %d – %d. %s %d',
            $start->day, self::MONTHS[$start->month], $start->year,
            $end->day, self::MONTHS[$end->month], $end->year
        );
    }

    /** "apr 2026" */
    public static function short(Carbon $date): string
    {
        return self::MONTHS_SHORT[$date->month].' '.$date->year;
    }
}
