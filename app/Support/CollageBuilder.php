<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;

/**
 * Skladá koláž fotiek do formátu Instagram story (1080 × 1920).
 *
 * Renderuje sa na serveri, nie v telefóne: fotky sú na R2 (sťahovanie na VPS je
 * zadarmo), Intervention aj GD sú tu už kvôli spracovaniu uploadov, a výstup má
 * plné rozlíšenie nezávislé od obrazovky zariadenia.
 *
 * Štýl kopíruje appku — papierové pozadie, biele rámiky a jemné pootočenie fotiek,
 * rukopisný nadpis v Caveate.
 */
class CollageBuilder
{
    public const W = 1080;
    public const H = 1920;

    private const PAPER = '#fafaf7';
    private const GREEN = '#2d5a3d';
    private const INK = '#3a3a36';
    private const FRAME = '#ffffff';

    /** Pootočenie jednotlivých fotiek v stupňoch — striedavo, nech to nevyzerá strojovo. */
    private const TILTS = [-2.5, 2.0, -1.5, 2.8, -2.0, 1.6];

    /**
     * Vráti cestu k hotovej koláži na médiovom disku.
     * Ak už rovnaká koláž existuje, znovu sa negeneruje.
     *
     * @param  string[]  $photoPaths  cesty k fotkám na médiovom disku
     */
    public static function make(array $photoPaths, string $title, ?string $subtitle = null): ?string
    {
        $photoPaths = array_values(array_filter($photoPaths));
        if (! $photoPaths) {
            return null;
        }

        $photoPaths = array_slice($photoPaths, 0, 4);
        $key = 'collages/'.substr(sha1(implode('|', $photoPaths).'|'.$title.'|'.$subtitle), 0, 24).'.jpg';

        $disk = Storage::disk(config('filesystems.media'));
        if ($disk->exists($key)) {
            return $key;
        }

        $manager = new ImageManager(new GdDriver());
        $canvas = $manager->createImage(self::W, self::H)->fill(self::PAPER);

        foreach (self::layout(count($photoPaths)) as $i => $slot) {
            $bytes = rescue(fn () => $disk->get($photoPaths[$i]), null, false);
            if (! $bytes) {
                continue;
            }

            $photo = $manager->decodeBinary($bytes)->cover($slot['w'], $slot['h']);
            self::frame($photo, $slot['w'], $slot['h']);

            $tilted = $photo->rotate(self::TILTS[$i % count(self::TILTS)], self::PAPER);
            $canvas->insert(
                $tilted,
                (int) ($slot['x'] - ($tilted->width() - $slot['w']) / 2),
                (int) ($slot['y'] - ($tilted->height() - $slot['h']) / 2),
                'top-left',
            );
        }

        self::captions($canvas, $title, $subtitle);

        $disk->put($key, (string) $canvas->encode(new JpegEncoder(quality: 88)));

        return $key;
    }

    /** Biely rámik okolo fotky — polaroidový dojem. */
    private static function frame(ImageInterface $photo, int $w, int $h): void
    {
        $photo->resizeCanvas($w + 26, $h + 26, self::FRAME, 'center');
    }

    private static function captions(ImageInterface $canvas, string $title, ?string $subtitle): void
    {
        $caveat = resource_path('fonts/Caveat_700Bold.ttf');
        $inter = resource_path('fonts/Inter_500Medium.ttf');

        $canvas->text($title, (int) (self::W / 2), 150, function ($font) use ($caveat) {
            $font->filename($caveat);
            $font->size(96);
            $font->color(self::GREEN);
            $font->align('center');
        });

        if ($subtitle) {
            $canvas->text($subtitle, (int) (self::W / 2), self::H - 170, function ($font) use ($inter) {
                $font->filename($inter);
                $font->size(34);
                $font->color(self::INK);
                $font->align('center');
            });
        }

        $canvas->text('S+M', (int) (self::W / 2), self::H - 90, function ($font) use ($caveat) {
            $font->filename($caveat);
            $font->size(44);
            $font->color(self::GREEN);
            $font->align('center');
        });
    }

    /**
     * Rozmiestnenie podľa počtu fotiek. Súradnice sú ľavý horný roh políčka
     * (bez rámika a pootočenia, tie sa dopočítajú pri vkladaní).
     *
     * @return array<int, array{x:int,y:int,w:int,h:int}>
     */
    private static function layout(int $count): array
    {
        $top = 300;

        return match (true) {
            $count >= 4 => [
                ['x' => 90,  'y' => $top,       'w' => 430, 'h' => 560],
                ['x' => 560, 'y' => $top + 40,  'w' => 430, 'h' => 560],
                ['x' => 90,  'y' => $top + 660, 'w' => 430, 'h' => 560],
                ['x' => 560, 'y' => $top + 700, 'w' => 430, 'h' => 560],
            ],
            $count === 3 => [
                ['x' => 130, 'y' => $top,       'w' => 820, 'h' => 620],
                ['x' => 110, 'y' => $top + 700, 'w' => 400, 'h' => 500],
                ['x' => 560, 'y' => $top + 740, 'w' => 400, 'h' => 500],
            ],
            $count === 2 => [
                ['x' => 120, 'y' => $top,       'w' => 840, 'h' => 620],
                ['x' => 120, 'y' => $top + 700, 'w' => 840, 'h' => 620],
            ],
            default => [
                ['x' => 110, 'y' => $top + 80, 'w' => 860, 'h' => 1080],
            ],
        };
    }
}
