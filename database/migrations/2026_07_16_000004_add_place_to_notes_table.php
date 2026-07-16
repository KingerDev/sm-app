<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Voliteľné miesto pri chvíľke (len popisok, neprepája sa s mapou)
        Schema::table('notes', function (Blueprint $table) {
            $table->string('place', 120)->nullable()->after('who');
        });
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn('place');
        });
    }
};
