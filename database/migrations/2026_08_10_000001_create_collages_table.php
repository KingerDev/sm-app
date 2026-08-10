<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Uložené koláže. Samotný obrázok leží na médiovom disku (R2), v databáze je
 * len záznam s nastavením, aby sa dal zoznam zobraziť a koláž prípadne
 * vygenerovať znova s inou šablónou.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collages', function (Blueprint $table) {
            $table->id();
            $table->string('template', 20);
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('path');
            $table->unsignedSmallInteger('photos_count')->default(0);
            // Odkiaľ sa fotky vzali — nech vieme koláž prerobiť
            $table->string('source_type', 20)->nullable();
            $table->string('source_id', 60)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collages');
    }
};
