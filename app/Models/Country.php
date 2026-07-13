<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    protected $fillable = ['flag', 'name', 'cities_count', 'cities', 'lat', 'lng', 'photos_count', 'sort_order'];

    protected $casts = [
        'cities' => 'array',
        'lat'    => 'float',
        'lng'    => 'float',
    ];
}
