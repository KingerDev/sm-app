<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Video v galérii. Tabuľka `photos` doteraz počítala len s obrázkami.
 *
 * Zámerne iba pridávame stĺpce, existujúce dáta sa nemenia — `kind` má default
 * 'image', takže všetkých doterajších 501 záznamov ostáva fotkami.
 *
 * Poster je statická snímka z videa: `poster_path` sa používa v prehrávači,
 * `poster_thumb_path` v mriežkach namiesto `thumb_path`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->string('kind', 10)->default('image')->after('photoable_id');
            $table->unsignedInteger('duration')->nullable()->after('path');
            $table->string('poster_path')->nullable()->after('duration');
            $table->string('poster_thumb_path')->nullable()->after('poster_path');
        });
    }

    public function down(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->dropColumn(['kind', 'duration', 'poster_path', 'poster_thumb_path']);
        });
    }
};
