<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WishlistSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('wishlist_items')->truncate();

        $items = [
            ['name' => 'Island',   'flag' => '🇮🇸', 'sort_order' => 1],
            ['name' => 'Lisabon',  'flag' => '🇵🇹', 'sort_order' => 2],
            ['name' => 'Tokio',    'flag' => '🇯🇵', 'sort_order' => 3],
        ];

        foreach ($items as $item) {
            DB::table('wishlist_items')->insert([
                ...$item,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
