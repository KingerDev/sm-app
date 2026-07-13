<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Čistý štart — len účty a základné nastavenia.
     * Demo dáta (momenty, kapsuly, wrapped…): php artisan db:seed --class=DemoSeeder
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}
