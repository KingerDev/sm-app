<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BucketCategory extends Model
{
    protected $fillable = ['slug', 'icon', 'name', 'sort_order'];

    public function items(): HasMany
    {
        return $this->hasMany(BucketItem::class)->orderBy('sort_order');
    }

    public function getDoneAttribute(): int
    {
        return $this->items()->where('is_done', true)->count();
    }

    public function getTotalAttribute(): int
    {
        return $this->items()->count();
    }
}
