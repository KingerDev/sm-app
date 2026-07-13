<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('countries')->truncate();

        // momentIds odkazujú na moments.slug
        $countries = [
            ['flag' => '🇸🇰', 'name' => 'Slovensko', 'photos_count' => 412, 'lat' => 48.669, 'lng' => 19.699, 'sort_order' => 1, 'cities' => [
                ['name' => 'Bratislava',   'photos' => 214, 'momentIds' => ['vyrocie', 'statnice']],
                ['name' => 'Vysoké Tatry', 'photos' => 89,  'momentIds' => ['tatry-26']],
                ['name' => 'Trenčín',      'photos' => 31,  'momentIds' => ['vianoce']],
                ['name' => 'Donovaly',     'photos' => 42,  'momentIds' => []],
                ['name' => 'Košice',       'photos' => 36,  'momentIds' => []],
            ]],
            ['flag' => '🇦🇹', 'name' => 'Rakúsko', 'photos_count' => 67, 'lat' => 47.5905, 'lng' => 14.14, 'sort_order' => 2, 'cities' => [
                ['name' => 'Viedeň',   'photos' => 54, 'momentIds' => ['wien-26']],
                ['name' => 'Salzburg', 'photos' => 13, 'momentIds' => []],
            ]],
            ['flag' => '🇨🇿', 'name' => 'Česko', 'photos_count' => 89, 'lat' => 49.8175, 'lng' => 15.473, 'sort_order' => 3, 'cities' => [
                ['name' => 'Praha', 'photos' => 71, 'momentIds' => ['praha-25']],
                ['name' => 'Brno',  'photos' => 18, 'momentIds' => []],
            ]],
            ['flag' => '🇭🇺', 'name' => 'Maďarsko', 'photos_count' => 34, 'lat' => 47.1625, 'lng' => 19.5033, 'sort_order' => 4, 'cities' => [
                ['name' => 'Budapešť', 'photos' => 34, 'momentIds' => []],
            ]],
            ['flag' => '🇳🇴', 'name' => 'Nórsko', 'photos_count' => 142, 'lat' => 69.6496, 'lng' => 18.956, 'sort_order' => 5, 'cities' => [
                ['name' => 'Tromsø', 'photos' => 142, 'momentIds' => []],
            ]],
            ['flag' => '🇮🇹', 'name' => 'Taliansko', 'photos_count' => 28, 'lat' => 41.9028, 'lng' => 12.4964, 'sort_order' => 6, 'cities' => [
                ['name' => 'Rím', 'photos' => 28, 'momentIds' => []],
            ]],
            ['flag' => '🇩🇪', 'name' => 'Nemecko', 'photos_count' => 19, 'lat' => 52.52, 'lng' => 13.405, 'sort_order' => 7, 'cities' => [
                ['name' => 'Berlín', 'photos' => 19, 'momentIds' => []],
            ]],
        ];

        DB::table('countries')->insert(array_map(fn ($c) => [
            ...$c,
            'cities'       => json_encode($c['cities']),
            'cities_count' => count($c['cities']),
            'created_at'   => now(),
            'updated_at'   => now(),
        ], $countries));
    }
}
