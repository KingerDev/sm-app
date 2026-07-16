<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            // Výrez pre titulnú fotku — samostatný súbor, originál zostáva nedotknutý
            $table->string('cover_path')->nullable()->after('thumb_path');
            $table->string('cover_thumb_path')->nullable()->after('cover_path');
        });
    }

    public function down(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->dropColumn(['cover_path', 'cover_thumb_path']);
        });
    }
};
