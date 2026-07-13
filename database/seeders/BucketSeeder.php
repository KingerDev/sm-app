<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BucketSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('bucket_items')->truncate();
        DB::table('bucket_categories')->truncate();
        Schema::enableForeignKeyConstraints();

        $categories = [
            ['slug' => 'travel',      'icon' => '✈', 'name' => 'Cestovanie', 'sort_order' => 1],
            ['slug' => 'food',        'icon' => '◉', 'name' => 'Jedlo',      'sort_order' => 2],
            ['slug' => 'experiences', 'icon' => '★', 'name' => 'Zážitky',    'sort_order' => 3],
            ['slug' => 'us',          'icon' => '♡', 'name' => 'My dvaja',   'sort_order' => 4],
        ];

        foreach ($categories as $cat) {
            DB::table('bucket_categories')->insert(array_merge($cat, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $travelId      = DB::table('bucket_categories')->where('slug', 'travel')->value('id');
        $foodId        = DB::table('bucket_categories')->where('slug', 'food')->value('id');
        $experiencesId = DB::table('bucket_categories')->where('slug', 'experiences')->value('id');
        $usId          = DB::table('bucket_categories')->where('slug', 'us')->value('id');

        $items = [
            // travel
            ['bucket_category_id' => $travelId, 'text' => 'Vidieť polárnu žiaru',   'sub_text' => 'Tromsø · feb 2025', 'is_done' => true,  'sort_order' => 1],
            ['bucket_category_id' => $travelId, 'text' => 'Road trip po Islande',    'sub_text' => 'leto 2027',         'is_done' => false, 'sort_order' => 2],
            ['bucket_category_id' => $travelId, 'text' => 'Lisabon na 3 dni',        'sub_text' => null,                'is_done' => false, 'sort_order' => 3],
            ['bucket_category_id' => $travelId, 'text' => 'Vlakom cez Alpy',         'sub_text' => null,                'is_done' => false, 'sort_order' => 4],
            ['bucket_category_id' => $travelId, 'text' => 'Víkend vo Viedni',        'sub_text' => 'apr 2026',          'is_done' => true,  'sort_order' => 5],
            ['bucket_category_id' => $travelId, 'text' => 'Praha — koncert',         'sub_text' => 'sep 2025',          'is_done' => true,  'sort_order' => 6],
            // food
            ['bucket_category_id' => $foodId, 'text' => 'Spraviť domácu pizzu od základov', 'sub_text' => null,         'is_done' => false, 'sort_order' => 1],
            ['bucket_category_id' => $foodId, 'text' => 'Vyskúšať omakase',                  'sub_text' => null,         'is_done' => true,  'sort_order' => 2],
            ['bucket_category_id' => $foodId, 'text' => 'Stužkový croissant zo St. Honoré',  'sub_text' => null,         'is_done' => false, 'sort_order' => 3],
            // experiences
            ['bucket_category_id' => $experiencesId, 'text' => 'Skúsiť paragliding',   'sub_text' => 'Donovaly · jún 2025', 'is_done' => true,  'sort_order' => 1],
            ['bucket_category_id' => $experiencesId, 'text' => 'Naučiť sa salsu',      'sub_text' => null,                  'is_done' => false, 'sort_order' => 2],
            ['bucket_category_id' => $experiencesId, 'text' => 'Surfovať aspoň jeden deň', 'sub_text' => null,              'is_done' => false, 'sort_order' => 3],
            // us
            ['bucket_category_id' => $usId, 'text' => 'Víkend bez telefónov',                       'sub_text' => null,         'is_done' => false, 'sort_order' => 1],
            ['bucket_category_id' => $usId, 'text' => 'Spísať 100 vecí, čo na sebe máme radi',      'sub_text' => null,         'is_done' => false, 'sort_order' => 2],
            ['bucket_category_id' => $usId, 'text' => 'Spoločná tatovačka',                          'sub_text' => 'apr 2025',   'is_done' => true,  'sort_order' => 3],
        ];

        DB::table('bucket_items')->insert(array_map(fn($i) => array_merge($i, [
            'created_at' => now(),
            'updated_at' => now(),
        ]), $items));
    }
}
