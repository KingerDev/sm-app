<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moments', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('place');
            $table->string('place_short');
            $table->date('date_start');
            $table->date('date_end')->nullable();
            $table->string('date_display');
            $table->string('date_short');
            $table->json('tags')->nullable();
            $table->unsignedSmallInteger('photos_count')->default(0);
            $table->unsignedSmallInteger('pinned_count')->default(0);
            $table->string('who', 10)->default('spolu');
            $table->string('seed', 50);
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moments');
    }
};
