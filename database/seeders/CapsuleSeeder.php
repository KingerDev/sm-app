<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CapsuleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('capsules')->truncate();

        $capsules = [
            [
                'slug'           => 'first-anniv',
                'title'          => 'List pre 1. výročie',
                'by'             => 'M',
                'created_date'   => '2024-12-20',
                'unlock_date'    => '2025-01-21',
                'has_letter'     => true,
                'photos_count'   => 5,
                'audio_duration' => null,
                'seed'           => 'cafe',
                'note'           => 'Napísala som ti list ešte počas zimy. Otvor ho 21. januára.',
                'preview'        => 'Drahý S, ak toto čítaš, prešiel rok. Pamätám si presne ten večer keď...',
                'sort_order'     => 1,
            ],
            [
                'slug'           => 'second-anniv',
                'title'          => 'Fotky + zvuk pre 2. výročie',
                'by'             => 'S',
                'created_date'   => '2025-08-14',
                'unlock_date'    => '2026-01-21',
                'has_letter'     => true,
                'photos_count'   => 12,
                'audio_duration' => '1:24',
                'seed'           => 'home',
                'note'           => 'Pesnička, ktorú sme si vtedy púšťali, a 12 fotiek z prvých dní.',
                'preview'        => '12 fotiek z jari 2024, hlasovka 1:24 a list — všetko ti dnes dávam naraz.',
                'sort_order'     => 2,
            ],
            [
                'slug'           => 'tatry-future',
                'title'          => 'Tatry — ako sme ich pamätali',
                'by'             => 'spolu',
                'created_date'   => '2026-02-12',
                'unlock_date'    => '2027-02-12',
                'has_letter'     => true,
                'photos_count'   => 8,
                'audio_duration' => null,
                'seed'           => 'ski',
                'note'           => 'Píšeme si dnes, ako sa cítime po Tatrách. Otvoríme o rok.',
                'preview'        => null,
                'sort_order'     => 3,
            ],
            [
                'slug'           => 'third-anniv',
                'title'          => 'List pre 3. výročie',
                'by'             => 'M',
                'created_date'   => '2026-03-30',
                'unlock_date'    => '2027-01-21',
                'has_letter'     => true,
                'photos_count'   => 3,
                'audio_duration' => null,
                'seed'           => 'forest',
                'note'           => 'Tri veci, čo ťa na mne dnes prekvapujú.',
                'preview'        => null,
                'sort_order'     => 4,
            ],
            [
                'slug'           => 'fifth-anniv',
                'title'          => 'Pre nás o päť rokov',
                'by'             => 'spolu',
                'created_date'   => '2026-04-21',
                'unlock_date'    => '2029-01-21',
                'has_letter'     => true,
                'photos_count'   => 20,
                'audio_duration' => '3:00',
                'seed'           => 'beach',
                'note'           => 'Veľká kapsula. Spolu sme tam dali sny, fotky a 3 minútovú hlasovku.',
                'preview'        => null,
                'sort_order'     => 5,
            ],
        ];

        DB::table('capsules')->insert(array_map(fn($c) => array_merge($c, [
            'created_at' => now(),
            'updated_at' => now(),
        ]), $capsules));
    }
}
