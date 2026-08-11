<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Koláž sa už neskladá na serveri zo šablóny, ale priamo v appke — používateľ
 * si v editore mení rozloženie, pozadie, text aj nálepky a vidí to naživo.
 * Server dostane hotový obrázok.
 *
 * `template` preto drží rozloženie (mriežka, polaroidy…), pribúda `format`
 * kvôli pomeru strán v zozname a `config` s celým nastavením, aby sa dala koláž
 * neskôr otvoriť na úpravu.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collages', function (Blueprint $table) {
            $table->string('format', 12)->default('square')->after('template');
            $table->json('config')->nullable()->after('subtitle');
        });
    }

    public function down(): void
    {
        Schema::table('collages', function (Blueprint $table) {
            $table->dropColumn(['format', 'config']);
        });
    }
};
