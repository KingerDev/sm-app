<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlyWrapped extends Model
{
    protected $fillable = [
        'wrapped_id', 'label', 'month', 'short', 'season', 'days_range',
        'headline', 'photos_count', 'top_day', 'top_day_count',
        'top_moment_title', 'top_moment_place', 'top_moment_id',
        'bucket_count', 'bucket_txt', 'outro', 'is_top', 'sort_order',
    ];

    protected $casts = ['is_top' => 'boolean'];
}
