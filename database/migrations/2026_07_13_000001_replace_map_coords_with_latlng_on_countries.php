<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('countries', function (Blueprint $table) {
            $table->decimal('lat', 8, 4)->nullable()->after('cities');
            $table->decimal('lng', 8, 4)->nullable()->after('lat');
            $table->dropColumn(['map_x', 'map_y']);
        });
    }

    public function down(): void
    {
        Schema::table('countries', function (Blueprint $table) {
            $table->unsignedSmallInteger('map_x')->default(0);
            $table->unsignedSmallInteger('map_y')->default(0);
            $table->dropColumn(['lat', 'lng']);
        });
    }
};
