<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_wrappeds', function (Blueprint $table) {
            $table->id();
            $table->string('wrapped_id', 20)->unique();
            $table->string('label');
            $table->string('month');
            $table->string('short', 10);
            $table->enum('season', ['winter', 'spring', 'summer', 'autumn']);
            $table->string('days_range', 20);
            $table->string('headline');
            $table->unsignedSmallInteger('photos_count')->default(0);
            $table->string('top_day', 20);
            $table->unsignedSmallInteger('top_day_count')->default(0);
            $table->string('top_moment_title');
            $table->string('top_moment_place');
            $table->string('top_moment_id')->nullable();
            $table->unsignedSmallInteger('bucket_count')->default(0);
            $table->string('bucket_txt')->nullable();
            $table->text('outro');
            $table->boolean('is_top')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_wrappeds');
    }
};
