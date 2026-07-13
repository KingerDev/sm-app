<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'together_since', 'value' => '2024-12-01'],
            // základ počítadiel — reálne fotky sa pripočítavajú automaticky
            ['key' => 'total_photos',   'value' => '0'],
            ['key' => 'total_km',       'value' => '0'],
            ['key' => 'mascot_variant', 'value' => 'pebbles'],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(['key' => $setting['key']], $setting);
        }
    }
}
