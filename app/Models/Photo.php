<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Photo extends Model
{
    protected $fillable = [
        'photoable_type', 'photoable_id', 'path', 'thumb_path', 'cover_path', 'cover_thumb_path',
        'is_pinned', 'is_cover', 'taken_at', 'sort_order',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_cover'  => 'boolean',
        'taken_at'  => 'date',
    ];

    protected $appends = ['url', 'thumb_url', 'cover_url', 'cover_thumb_url'];

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

    /** Výrez titulnej fotky (null = bez výrezu, použije sa originál) */
    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover_path ? Storage::disk('public')->url($this->cover_path) : null;
    }

    public function getCoverThumbUrlAttribute(): ?string
    {
        $path = $this->cover_thumb_path ?: $this->cover_path;

        return $path ? Storage::disk('public')->url($path) : null;
    }

    protected static function booted(): void
    {
        // s DB záznamom odídu z disku aj súbory
        static::deleting(function (Photo $photo) {
            \App\Support\Images::delete($photo->path, $photo->thumb_path, $photo->cover_path, $photo->cover_thumb_path);
        });
    }
}
