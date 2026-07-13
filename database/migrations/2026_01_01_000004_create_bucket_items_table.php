<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bucket_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bucket_category_id')->constrained()->cascadeOnDelete();
            $table->string('text');
            $table->string('sub_text')->nullable();
            $table->boolean('is_done')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bucket_items');
    }
};
