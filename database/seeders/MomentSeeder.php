<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MomentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('moments')->truncate();

        $moments = [
            [
                'slug'         => 'wien-26',
                'title'        => 'Víkend vo Viedni',
                'place'        => 'Viedeň · Rakúsko',
                'place_short'  => 'Viedeň, AT',
                'date_start'   => '2026-04-12',
                'date_end'     => '2026-04-14',
                'date_display' => '12. – 14. apríl 2026',
                'date_short'   => 'apr 2026',
                'tags'         => json_encode(['cestovanie', 'my dvaja']),
                'photos_count' => 47,
                'pinned_count' => 3,
                'who'          => 'S',
                'seed'         => 'vienna',
                'description'  => 'Predĺžený víkend, ktorý sme plánovali pol roka. Schönbrunn pred otvorením, kávičky v Café Central, večerná prechádzka okolo Stephansdomu. Vrátili sme sa s 47 fotkami a pár kg navyše.',
                'sort_order'   => 1,
            ],
            [
                'slug'         => 'statnice',
                'title'        => 'Učenie na štátnice',
                'place'        => 'doma · Bratislava',
                'place_short'  => 'doma',
                'date_start'   => '2026-03-05',
                'date_end'     => '2026-03-30',
                'date_display' => '5. – 30. marec 2026',
                'date_short'   => 'mar 2026',
                'tags'         => json_encode(['my dvaja']),
                'photos_count' => 12,
                'pinned_count' => 1,
                'who'          => 'M',
                'seed'         => 'desk',
                'description'  => 'Tri týždne pri stoloch, káva v termoske, jeden druhému sme robili kartičky. Stálo to za to.',
                'sort_order'   => 2,
            ],
            [
                'slug'         => 'tatry-26',
                'title'        => 'Tatry · zimná päťka',
                'place'        => 'Štrbské Pleso · SK',
                'place_short'  => 'Tatry',
                'date_start'   => '2026-02-08',
                'date_end'     => '2026-02-12',
                'date_display' => '8. – 12. február 2026',
                'date_short'   => 'feb 2026',
                'tags'         => json_encode(['cestovanie', 'zážitky']),
                'photos_count' => 89,
                'pinned_count' => 5,
                'who'          => 'spolu',
                'seed'         => 'ski',
                'description'  => 'Päť dní snehu, jedna večera v hoteli, dva pády na svahu. Najfoto deň: 17. február — 23 záberov.',
                'sort_order'   => 3,
            ],
            [
                'slug'         => 'vyrocie',
                'title'        => '2. výročie ♡',
                'place'        => 'reštaurácia STROM',
                'place_short'  => 'BA',
                'date_start'   => '2026-01-21',
                'date_end'     => null,
                'date_display' => '21. január 2026',
                'date_short'   => 'jan 2026',
                'tags'         => json_encode(['my dvaja']),
                'photos_count' => 8,
                'pinned_count' => 2,
                'who'          => 'spolu',
                'seed'         => 'party',
                'description'  => 'Tichá večera, prvá fľaša Saint-Émilion. Spolu už 731 dní.',
                'sort_order'   => 4,
            ],
            [
                'slug'         => 'vianoce',
                'title'        => 'Vianoce u rodičov',
                'place'        => 'Trenčín',
                'place_short'  => 'Trenčín',
                'date_start'   => '2025-12-24',
                'date_end'     => '2025-12-27',
                'date_display' => '24. – 27. december 2025',
                'date_short'   => 'dec 2025',
                'tags'         => json_encode(['rodina']),
                'photos_count' => 31,
                'pinned_count' => 1,
                'who'          => 'M',
                'seed'         => 'home',
                'description'  => 'Prvé spoločné Vianoce u tvojich. Stromček, kapustnica, snežilo až po obed.',
                'sort_order'   => 5,
            ],
            [
                'slug'         => 'praha-25',
                'title'        => 'Koncert v Prahe',
                'place'        => 'O2 arena · Praha',
                'place_short'  => 'Praha',
                'date_start'   => '2025-09-14',
                'date_end'     => null,
                'date_display' => '14. september 2025',
                'date_short'   => 'sep 2025',
                'tags'         => json_encode(['zážitky']),
                'photos_count' => 32,
                'pinned_count' => 2,
                'who'          => 'S',
                'seed'         => 'prague',
                'description'  => 'Stál som na špičkách, ty si si držala uši. Tri hodiny v daždi po koncerte v hľadaní hotela.',
                'sort_order'   => 6,
            ],
        ];

        DB::table('moments')->insert(array_map(fn($m) => array_merge($m, [
            'created_at' => now(),
            'updated_at' => now(),
        ]), $moments));
    }
}
