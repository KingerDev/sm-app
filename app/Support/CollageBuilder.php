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
 * Každá šablóna je samostatná metóda `render*`. Spoločné je len vkladanie fotiek
 * a text — zvyšok si šablóna kreslí sama.
 */
class CollageBuilder
{
    public const W = 1080;
    public const H = 1920;

    /** Koľko fotiek ktorá šablóna využije. */
    public const TEMPLATES = [
        'polaroid' => 4,
        'grid' => 5,
        'tape' => 3,
        'heart' => 26,
        'player' => 1,
        'calendar' => 20,
    ];

    private const PAPER = '#fafaf7';
    private const GREEN = '#2d5a3d';
    private const INK = '#3a3a36';
    private const MUTED = '#6b6862';
    private const FRAME = '#ffffff';
    private const LINE = '#e8e4d9';

    private const TILTS = [-2.5, 2.0, -1.5, 2.8, -2.0, 1.6];

    public static function make(
        array $photoPaths,
        string $title,
        ?string $subtitle = null,
        string $template = 'polaroid',
    ): ?string {
        $photoPaths = array_values(array_filter($photoPaths));
        if (! $photoPaths) {
            return null;
        }

        $template = isset(self::TEMPLATES[$template]) ? $template : 'polaroid';
        $photoPaths = array_slice($photoPaths, 0, self::TEMPLATES[$template]);

        $key = 'collages/'.substr(
            sha1($template.'|'.implode('|', $photoPaths).'|'.$title.'|'.$subtitle),
            0,
            24
        ).'.jpg';

        $disk = Storage::disk(config('filesystems.media'));
        if ($disk->exists($key)) {
            return $key;
        }

        $photos = [];
        foreach ($photoPaths as $path) {
            $bytes = rescue(fn () => $disk->get($path), null, false);
            if ($bytes) {
                $photos[] = $bytes;
            }
        }

        if (! $photos) {
            return null;
        }

        $manager = new ImageManager(new GdDriver());
        $canvas = $manager->createImage(self::W, self::H)->fill(self::PAPER);

        match ($template) {
            'grid' => self::renderGrid($manager, $canvas, $photos, $title, $subtitle),
            'tape' => self::renderTape($manager, $canvas, $photos, $title, $subtitle),
            'heart' => self::renderHeart($manager, $canvas, $photos, $title, $subtitle),
            'player' => self::renderPlayer($manager, $canvas, $photos, $title, $subtitle),
            'calendar' => self::renderCalendar($manager, $canvas, $photos, $title, $subtitle),
            default => self::renderPolaroid($manager, $canvas, $photos, $title, $subtitle),
        };

        $disk->put($key, (string) $canvas->encode(new JpegEncoder(quality: 88)));

        return $key;
    }

    // ---------------------------------------------------------------- šablóny

    /** Rozsypané polaroidy na papieri. */
    private static function renderPolaroid(ImageManager $m, ImageInterface $c, array $photos, string $title, ?string $sub): void
    {
        $slots = match (true) {
            count($photos) >= 4 => [
                [90, 300, 430, 560], [560, 340, 430, 560],
                [90, 960, 430, 560], [560, 1000, 430, 560],
            ],
            count($photos) === 3 => [[130, 300, 820, 620], [110, 1000, 400, 500], [560, 1040, 400, 500]],
            count($photos) === 2 => [[120, 300, 840, 620], [120, 1000, 840, 620]],
            default => [[110, 380, 860, 1080]],
        };

        foreach ($photos as $i => $bytes) {
            if (! isset($slots[$i])) {
                break;
            }
            [$x, $y, $w, $h] = $slots[$i];
            self::place($m, $c, $bytes, $x, $y, $w, $h, self::TILTS[$i % 6], 26);
        }

        self::title($c, $title, 150);
        self::footer($c, $sub);
    }

    /** Čistá mriežka — 2 stĺpce, jedno políčko patrí textu. */
    private static function renderGrid(ImageManager $m, ImageInterface $c, array $photos, string $title, ?string $sub): void
    {
        $pad = 40;
        $gap = 12;
        $cell = (int) ((self::W - 2 * $pad - $gap) / 2);
        $top = 300;
        $textIndex = 3;

        $pi = 0;
        for ($r = 0; $r < 3; $r++) {
            for ($col = 0; $col < 2; $col++) {
                $i = $r * 2 + $col;
                $x = $pad + $col * ($cell + $gap);
                $y = $top + $r * ($cell + $gap);

                if ($i === $textIndex) {
                    $c->drawRectangle(function ($rect) use ($cell, $x, $y) {
                $rect->at($x, $y);
                        $rect->size($cell, $cell);
                        $rect->background(CollageBuilder::GREEN);
                    });
                    self::centeredText($c, $title, $x + $cell / 2, $y + $cell / 2 - 10, 58, self::PAPER, 'caveat');
                    if ($sub) {
                        self::centeredText($c, $sub, $x + $cell / 2, $y + $cell / 2 + 60, 22, self::PAPER, 'inter');
                    }

                    continue;
                }

                if (isset($photos[$pi])) {
                    self::place($m, $c, $photos[$pi++], $x, $y, $cell, $cell, 0, 0);
                }
            }
        }

        self::brand($c, self::H - 120);
    }

    /** Polaroidy prilepené páskou. */
    private static function renderTape(ImageManager $m, ImageInterface $c, array $photos, string $title, ?string $sub): void
    {
        $slots = [[130, 340, 560, 660], [400, 1090, 560, 620], [80, 1160, 280, 340]];

        foreach ($photos as $i => $bytes) {
            if (! isset($slots[$i])) {
                break;
            }
            [$x, $y, $w, $h] = $slots[$i];
            $tilt = self::TILTS[$i % 6];
            self::place($m, $c, $bytes, $x, $y, $w, $h, $tilt, 30);
            // Páska sedí na hornej hrane, mierne pootočená oproti fotke
            self::tape($m, $c, (int) ($x + $w / 2), $y - 8, (int) ($w * 0.42), $tilt * 4, $i);
        }

        self::title($c, $title, 180);
        self::footer($c, $sub);
    }

    /** Fotky rozsypané do tvaru srdca. */
    private static function renderHeart(ImageManager $m, ImageInterface $c, array $photos, string $title, ?string $sub): void
    {
        $cx = self::W / 2;
        $cy = 1000;
        $scale = 32;
        $size = 155;

        // Sústredné prstence po krivke srdca — každý sa vykreslí celý, až potom
        // sa prejde na menší. Miešanie mierok v jednom priechode obrys rozhádže.
        $rings = [[15, 1.0], [8, 0.58], [3, 0.22]];

        $i = 0;
        foreach ($rings as [$count, $shrink]) {
            for ($k = 0; $k < $count; $k++) {
                if (! isset($photos[$i])) {
                    break 2;
                }

                // Vnútorné prstence posunieme o pol kroku, nech fotky nesedia
                // priamo pod tými z vonkajšieho.
                $t = (($k + ($shrink < 1 ? 0.5 : 0)) / $count) * 2 * M_PI;
                $hx = 16 * pow(sin($t), 3) * $shrink;
                $hy = (13 * cos($t) - 5 * cos(2 * $t) - 2 * cos(3 * $t) - cos(4 * $t)) * $shrink;

                self::place(
                    $m, $c, $photos[$i],
                    (int) ($cx + $hx * $scale - $size / 2),
                    (int) ($cy - $hy * $scale - $size / 2),
                    $size, $size,
                    self::TILTS[$i % 6] * 2.2,
                    14,
                );
                $i++;
            }
        }

        self::title($c, $title, 190);
        self::footer($c, $sub);
    }

    /** Jedna fotka v štýle hudobného prehrávača. */
    private static function renderPlayer(ImageManager $m, ImageInterface $c, array $photos, string $title, ?string $sub): void
    {
        $cardX = 90;
        $cardY = 300;
        $cardW = self::W - 2 * $cardX;
        $cardH = 1300;

        $c->drawRectangle(function ($r) use ($cardH, $cardW, $cardX, $cardY) {
                $r->at($cardX, $cardY);
            $r->size($cardW, $cardH);
            $r->background(CollageBuilder::FRAME);
            $r->border(CollageBuilder::LINE, 2);
        });

        self::place($m, $c, $photos[0], $cardX + 40, $cardY + 40, $cardW - 80, 820, 0, 0);

        $textY = $cardY + 950;
        self::centeredText($c, $title, self::W / 2, $textY, 58, self::INK, 'caveat');
        if ($sub) {
            self::centeredText($c, $sub, self::W / 2, $textY + 60, 26, self::MUTED, 'inter');
        }

        // Prehrávacia lišta s pozíciou a tri tlačidlá
        $barY = $textY + 140;
        $barW = $cardW - 140;
        $c->drawRectangle(function ($r) use ($barW, $barY, $cardX) {
                $r->at($cardX + 70, $barY);
            $r->size($barW, 6);
            $r->background(CollageBuilder::LINE);
        });
        $c->drawRectangle(function ($r) use ($barW, $barY, $cardX) {
                $r->at($cardX + 70, $barY);
            $r->size((int) ($barW * 0.42), 6);
            $r->background(CollageBuilder::GREEN);
        });
        $c->drawCircle(function ($d) use ($barW, $barY, $cardX) {
                $d->at($cardX + 70 + (int) ($barW * 0.42), $barY + 3);
            $d->radius(14);
            $d->background(CollageBuilder::GREEN);
        });

        $btnY = $barY + 110;
        foreach ([-160, 0, 160] as $k => $dx) {
            $c->drawCircle(function ($d) use ($btnY, $dx, $k) {
                $d->at((int) (self::W / 2 + $dx), $btnY);
                $d->radius($k === 1 ? 46 : 26);
                $d->background($k === 1 ? CollageBuilder::GREEN : CollageBuilder::LINE);
            });
        }

        self::brand($c, self::H - 90);
    }

    /** Fotky rozmiestnené ako dni v mesiaci. */
    private static function renderCalendar(ImageManager $m, ImageInterface $c, array $photos, string $title, ?string $sub): void
    {
        $pad = 50;
        $gap = 8;
        $cols = 5;
        $rows = 4;
        $cell = (int) ((self::W - 2 * $pad - ($cols - 1) * $gap) / $cols);
        $top = 420;

        for ($r = 0; $r < $rows; $r++) {
            for ($col = 0; $col < $cols; $col++) {
                $i = $r * $cols + $col;
                $x = $pad + $col * ($cell + $gap);
                $y = $top + $r * ($cell + $gap);

                if (isset($photos[$i])) {
                    self::place($m, $c, $photos[$i], $x, $y, $cell, $cell, 0, 0);
                } else {
                    // Prázdny deň — tlmené políčko, nech je vidieť rytmus mesiaca
                    $c->drawRectangle(function ($rect) use ($cell, $x, $y) {
                $rect->at($x, $y);
                        $rect->size($cell, $cell);
                        $rect->background('#eef2ee');
                    });
                }
            }
        }

        self::title($c, $title, 210);
        self::centeredText($c, 'p o    u t    s t    š t    p i', self::W / 2, 350, 26, self::MUTED, 'inter');
        self::footer($c, $sub);
    }

    // -------------------------------------------------------------- pomocníci

    /** Vloží fotku s voliteľným bielym rámikom a pootočením. */
    private static function place(
        ImageManager $m,
        ImageInterface $canvas,
        string $bytes,
        int $x,
        int $y,
        int $w,
        int $h,
        float $tilt = 0,
        int $frame = 0,
    ): void {
        // Poškodený alebo neobrázkový súbor nesmie zhodiť celú koláž — políčko
        // zostane prázdne a zvyšok sa vykreslí.
        $photo = rescue(fn () => $m->decodeBinary($bytes)->cover($w, $h), null, false);
        if (! $photo) {
            return;
        }

        if ($frame > 0) {
            $photo->resizeCanvas($w + $frame, $h + $frame, self::FRAME, 'center');
        }

        if (abs($tilt) > 0.01) {
            $photo = $photo->rotate($tilt, self::PAPER);
        }

        $canvas->insert(
            $photo,
            (int) ($x - ($photo->width() - $w) / 2),
            (int) ($y - ($photo->height() - $h) / 2),
            'top-left',
        );
    }

    /**
     * Nalepí prúžok washi pásky. Používa skutočné PNG podklady z resources/collage
     * — kreslený obdĺžnik vyzeral lacno, páska má natrhnuté okraje aj priesvitnosť.
     * Keď podklady chýbajú, fotka sa nalepí bez pásky namiesto pádu.
     */
    private static function tape(ImageManager $m, ImageInterface $c, int $x, int $y, int $width, float $tilt, int $variant): void
    {
        $files = glob(resource_path('collage/tape/*.png')) ?: [];
        if (! $files) {
            return;
        }

        sort($files);
        $file = $files[$variant % count($files)];

        $tape = rescue(fn () => $m->decodePath($file), null, false);
        if (! $tape) {
            return;
        }

        $h = (int) ($tape->height() * ($width / $tape->width()));
        $tape->resize($width, max(1, $h));

        if (abs($tilt) > 0.01) {
            $tape = $tape->rotate($tilt, 'rgba(0,0,0,0)');
        }

        $c->insert($tape, (int) ($x - $tape->width() / 2), (int) ($y - $tape->height() / 2), 'top-left');
    }

    private static function title(ImageInterface $c, string $text, int $y): void
    {
        self::centeredText($c, $text, self::W / 2, $y, 96, self::GREEN, 'caveat');
    }

    private static function footer(ImageInterface $c, ?string $sub): void
    {
        if ($sub) {
            self::centeredText($c, $sub, self::W / 2, self::H - 170, 34, self::INK, 'inter');
        }
        self::brand($c, self::H - 90);
    }

    private static function brand(ImageInterface $c, int $y): void
    {
        self::centeredText($c, 'S+M', self::W / 2, $y, 44, self::GREEN, 'caveat');
    }

    private static function centeredText(
        ImageInterface $c,
        string $text,
        float $x,
        float $y,
        int $size,
        string $color,
        string $font,
    ): void {
        $file = resource_path($font === 'caveat' ? 'fonts/Caveat_700Bold.ttf' : 'fonts/Inter_500Medium.ttf');

        $c->text($text, (int) $x, (int) $y, function ($f) use ($color, $file, $size) {
            $f->filename($file);
            $f->size($size);
            $f->color($color);
            $f->align('center');
        });
    }
}
