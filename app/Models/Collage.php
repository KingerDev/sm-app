<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Collage extends Model
{
    protected $fillable = [
        'template', 'format', 'title', 'subtitle', 'config', 'path', 'photos_count',
        'source_type', 'source_id',
    ];

    protected $casts = ['config' => 'array'];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return Storage::disk(config('filesystems.media'))->url($this->path);
    }

    protected static function booted(): void
    {
        // Obrázok sa maže so záznamom, ale len ak ho nepoužíva iná koláž —
        // rovnaké nastavenie dá rovnaký súbor a ten je zdieľaný.
        static::deleting(function (Collage $collage) {
            $stillUsed = static::where('path', $collage->path)
                ->where('id', '!=', $collage->id)
                ->exists();

            if (! $stillUsed) {
                Storage::disk(config('filesystems.media'))->delete($collage->path);
            }
        });
    }
}
