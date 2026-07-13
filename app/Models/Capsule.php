<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Capsule extends Model
{
    protected $fillable = [
        'slug', 'title', 'by', 'created_date', 'unlock_date',
        'has_letter', 'letter', 'photos_count', 'audio_duration', 'audio_path', 'seed', 'note', 'preview', 'sort_order',
    ];

    protected $casts = [
        'has_letter'   => 'boolean',
        'created_date' => 'date',
        'unlock_date'  => 'date',
    ];

    protected $appends = ['audio_url'];

    public function photos(): MorphMany
    {
        return $this->morphMany(Photo::class, 'photoable')
            ->orderByDesc('is_pinned')
            ->orderBy('sort_order');
    }

    public function getAudioUrlAttribute(): ?string
    {
        return $this->audio_path
            ? \Illuminate\Support\Facades\Storage::disk('public')->url($this->audio_path)
            : null;
    }

    protected static function booted(): void
    {
        // so zmazanou kapsulou odídu aj fotky a audio
        static::deleting(function (Capsule $capsule) {
            $capsule->photos->each->delete();
            if ($capsule->audio_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($capsule->audio_path);
            }
        });
    }
}
