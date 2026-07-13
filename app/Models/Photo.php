<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Photo extends Model
{
    protected $fillable = [
        'photoable_type', 'photoable_id', 'path', 'is_pinned', 'taken_at', 'sort_order',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'taken_at'  => 'date',
    ];

    protected $appends = ['url'];

    public function photoable(): MorphTo
    {
        return $this->morphTo();
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
