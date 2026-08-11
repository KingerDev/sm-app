<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollageGift extends Model
{
    protected $fillable = ['collage_id', 'from_user_id', 'to_user_id', 'note', 'opened_at'];

    protected $casts = ['opened_at' => 'datetime'];

    public function collage(): BelongsTo
    {
        return $this->belongsTo(Collage::class);
    }

    public function from(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function to(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
