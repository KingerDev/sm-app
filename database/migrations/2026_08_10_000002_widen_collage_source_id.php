<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `source_id` drží slug momentu, ktorý má rovnaký strop ako stĺpec `moments.slug`
 * (255). Pôvodných 60 znakov nestačilo — dlhšie názvy momentov to odmietalo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collages', function (Blueprint $table) {
            $table->string('source_id', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('collages', function (Blueprint $table) {
            $table->string('source_id', 60)->nullable()->change();
        });
    }
};
