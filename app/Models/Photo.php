<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Photo extends Model
{
    protected $fillable = [
        'photoable_type', 'photoable_id', 'path', 'thumb_path', 'is_pinned', 'taken_at', 'sort_order',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'taken_at'  => 'date',
    ];

    protected $appends = ['url', 'thumb_url'];

    public function photoable(): MorphTo
    {
        return $this->morphTo();
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }

    public function getThumbUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->thumb_path ?: $this->path);
    }

    protected static function booted(): void
    {
        // s DB záznamom odídu z disku aj súbory
        static::deleting(function (Photo $photo) {
            \App\Support\Images::delete($photo->path, $photo->thumb_path);
        });
    }
}
