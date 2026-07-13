<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Fiktívne demo dáta z dizajnového prototypu — na vyskúšanie appky.
 * Spustenie: php artisan db:seed --class=DemoSeeder
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MomentSeeder::class,
            BucketSeeder::class,
            CountrySeeder::class,
            CapsuleSeeder::class,
            MonthlyWrappedSeeder::class,
            WishlistSeeder::class,
        ]);
    }
}
