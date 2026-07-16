<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Štítky odstránené z appky úplne
        Schema::table('moments', function (Blueprint $table) {
            $table->dropColumn('tags');
        });
    }

    public function down(): void
    {
        Schema::table('moments', function (Blueprint $table) {
            $table->json('tags')->nullable();
        });
    }
};
