<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BucketItem extends Model
{
    protected $fillable = ['bucket_category_id', 'text', 'sub_text', 'is_done', 'sort_order'];

    protected $casts = ['is_done' => 'boolean'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(BucketCategory::class, 'bucket_category_id');
    }
}
