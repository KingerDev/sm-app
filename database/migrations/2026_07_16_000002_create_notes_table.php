<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Momentky („chvíľky") — mikro-poznámky z bežných dní.
        // Bez miesta a štítkov, nejdú do mapy ani štatistík.
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->text('text');
            $table->string('who', 10)->default('spolu');
            $table->date('date');
            $table->string('photo_path')->nullable();
            $table->string('photo_thumb_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
