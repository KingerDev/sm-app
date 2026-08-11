<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Koláže spravené ešte serverom mali vždy 1080 × 1920, teda formát „wall".
 * Predchádzajúca migrácia im dala predvolený „square" a zoznam by ich preto
 * orezal na štvorec.
 *
 * Poznávacie znamenie je prázdne `config` — to nesú len koláže z appky.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('collages')->whereNull('config')->update(['format' => 'wall']);
    }

    public function down(): void
    {
        // Späť sa vrátiť nedá — pôvodný formát nebol nikde uložený.
    }
};
