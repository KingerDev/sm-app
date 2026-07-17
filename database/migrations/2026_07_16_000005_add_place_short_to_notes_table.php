<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Miesto chvíľky funguje ako pri momentoch — label + krátky názov na zoskupovanie
        Schema::table('notes', function (Blueprint $table) {
            $table->string('place_short', 60)->nullable()->after('place');
        });
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn('place_short');
        });
    }
};
