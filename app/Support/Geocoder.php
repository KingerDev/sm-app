<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;

class Geocoder
{
    /**
     * Vyhľadá miesto cez OSM Nominatim (bezplatné, bez kľúča).
     * Vracia ['lat' => float, 'lng' => float, 'country_code' => 'sk'|null] alebo null.
     */
    public static function search(string $query): ?array
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'SM-App/1.0 (private couples app)',
            ])->timeout(8)->get('https://nominatim.openstreetmap.org/search', [
                'q'               => $query,
                'format'          => 'json',
                'limit'           => 1,
                'addressdetails'  => 1,
                'accept-language' => 'sk',
            ]);

            $hit = $response->json()[0] ?? null;
            if (! $hit) {
                return null;
            }

            return [
                'lat'          => (float) $hit['lat'],
                'lng'          => (float) $hit['lon'],
                'country_code' => $hit['address']['country_code'] ?? null,
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    /** ISO kód krajiny -> emoji vlajka (sk -> 🇸🇰) */
    public static function flagEmoji(?string $countryCode): ?string
    {
        if (! $countryCode || strlen($countryCode) !== 2) {
            return null;
        }

        return implode('', array_map(
            fn (string $c) => mb_chr(0x1F1E6 + ord(strtoupper($c)) - 65, 'UTF-8'),
            str_split($countryCode)
        ));
    }
}
