<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Koláž poslaná tomu druhému. Na Domove sa mu objaví ako zalepená obálka a
 * odosielateľ vidí, či ju už otvoril.
 *
 * Darček je samostatný záznam, nie stĺpec na koláži — tá istá koláž sa dá
 * poslať znova a každé poslanie má vlastný odkaz aj vlastné otvorenie.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collage_gifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collage_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('to_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('note')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamps();

            $table->index(['to_user_id', 'opened_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collage_gifts');
    }
};
