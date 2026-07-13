<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('capsules', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('by', 10)->default('spolu');
            $table->date('created_date');
            $table->date('unlock_date');
            $table->boolean('has_letter')->default(false);
            $table->unsignedSmallInteger('photos_count')->default(0);
            $table->string('audio_duration', 10)->nullable();
            $table->string('seed', 50);
            $table->text('note')->nullable();
            $table->text('preview')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capsules');
    }
};
