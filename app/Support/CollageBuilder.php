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
        'heart' => 27,
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
        // Prázdne miesta zostávajú prázdne — index určuje políčko šablóny.
        if (! array_filter($photoPaths)) {
            return null;
        }

        $template = isset(self::TEMPLATES[$template]) ? $template : 'polaroid';
        $photoPaths = array_slice($photoPaths, 0, self::TEMPLATES[$template]);

        // Do kľúča patrí aj geometria šablóny — inak by sa po zmene rozloženia
        // vracala stará koláž z vyrovnávacej pamäte a vyzeralo by to, že oprava
        // nezabrala.
        $key = 'collages/'.substr(
            sha1(
                $template
                .'|'.md5(json_encode(self::slots($template)))
                .'|'.implode('|', array_map(fn ($p) => (string) $p, $photoPaths))
                .'|'.$title.'|'.$subtitle
            ),
            0,
            24
        ).'.jpg';

        $disk = Storage::disk(config('filesystems.media'));
        if ($disk->exists($key)) {
            return $key;
        }

        $photos = [];
        foreach (array_values($photoPaths) as $i => $path) {
            $photos[$i] = $path ? rescue(fn () => $disk->get($path), null, false) : null;
        }

        if (! array_filter($photos)) {
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

    /**
     * Políčka šablóny v absolútnych pixeloch: [x, y, šírka, výška, náklon].
     *
     * Jediný zdroj pravdy — z tohto kreslí aj vykresľovanie, aj z toho appka
     * skladá náhľad. Keby to bolo na dvoch miestach, náhľad by časom klamal.
     *
     * @return array<int, array{0:int,1:int,2:int,3:int,4:float}>
     */
    public static function slots(string $template): array
    {
        return match ($template) {
            'grid' => self::gridSlots(),
            'tape' => [
                [130, 340, 560, 660, -2.5],
                [400, 1090, 560, 620, 2.0],
                [80, 1160, 280, 340, -1.5],
            ],
            'heart' => self::heartSlots(),
            'player' => [[130, 340, 820, 820, 0.0]],
            'calendar' => self::calendarSlots(),
            default => [
                [90, 300, 430, 560, -2.5],
                [560, 340, 430, 560, 2.0],
                [90, 960, 430, 560, -1.5],
                [560, 1000, 430, 560, 2.8],
            ],
        };
    }

    /** Políčka ako pomer 0–1 — pre náhľad v appke, nezávisle od rozlíšenia. */
    public static function slotsNormalized(string $template): array
    {
        return array_map(fn (array $s) => [
            'x' => round($s[0] / self::W, 4),
            'y' => round($s[1] / self::H, 4),
            'w' => round($s[2] / self::W, 4),
            'h' => round($s[3] / self::H, 4),
            'tilt' => $s[4],
        ], self::slots($template));
    }

    private static function gridSlots(): array
    {
        $pad = 40;
        $gap = 12;
        $cell = (int) ((self::W - 2 * $pad - $gap) / 2);
        $top = 300;
        $slots = [];

        for ($r = 0; $r < 3; $r++) {
            for ($col = 0; $col < 2; $col++) {
                // Index 3 patrí textu, fotka tam nejde
                if ($r * 2 + $col === 3) {
                    continue;
                }
                $slots[] = [$pad + $col * ($cell + $gap), $top + $r * ($cell + $gap), $cell, $cell, 0.0];
            }
        }

        return $slots;
    }

    private static function heartSlots(): array
    {
        // Bunky mriežky, ktoré padnú dovnútra tvaru srdca: (x²+y²−1)³ − x²y³ ≤ 0.
        // Predtým som skladal prstence po krivke a sťahoval ich k počiatku — ten
        // ale nie je stredom srdca, takže sa vnútorné fotky zosypali na kopu.
        $cols = 7;
        $rows = 7;
        $cells = [];

        for ($r = 0; $r < $rows; $r++) {
            for ($c = 0; $c < $cols; $c++) {
                $x = -1.30 + ($c + 0.5) * (2.6 / $cols);
                $y = 1.30 - ($r + 0.5) * (2.65 / $rows);

                if (pow($x * $x + $y * $y - 1, 3) - $x * $x * pow($y, 3) <= 0) {
                    $cells[] = [$c, $r];
                }
            }
        }

        // Prázdne spodné riadky nechceme započítať do výšky
        $usedRows = max(array_column($cells, 1)) + 1;

        $areaX = 70;
        $areaY = 560;
        $areaW = self::W - 2 * $areaX;
        $size = (int) min($areaW / $cols, 1040 / $usedRows) - 6;
        $stepX = $areaW / $cols;
        $stepY = ($size + 6);

        $slots = [];
        foreach ($cells as $i => [$c, $r]) {
            $slots[] = [
                (int) ($areaX + $c * $stepX + ($stepX - $size) / 2),
                (int) ($areaY + $r * $stepY),
                $size,
                $size,
                self::TILTS[$i % 6] * 0.8,
            ];
        }

        return $slots;
    }

    private static function calendarSlots(): array
    {
        $pad = 50;
        $gap = 8;
        $cols = 5;
        $cell = (int) ((self::W - 2 * $pad - ($cols - 1) * $gap) / $cols);
        $top = 420;
        $slots = [];

        for ($r = 0; $r < 4; $r++) {
            for ($col = 0; $col < $cols; $col++) {
                $slots[] = [$pad + $col * ($cell + $gap), $top + $r * ($cell + $gap), $cell, $cell, 0.0];
            }
        }

        return $slots;
    }

    // ---------------------------------------------------------------- šablóny

    /** Rozsypané polaroidy na papieri. */
    private static function renderPolaroid(ImageManager $m, ImageInterface $c, array $photos, string $title, ?string $sub): void
    {
        foreach (self::slots('polaroid') as $i => [$x, $y, $w, $h, $tilt]) {
            if (empty($photos[$i])) {
                continue;
            }
            self::place($m, $c, $photos[$i], $x, $y, $w, $h, $tilt, 26);
        }

        self::title($c, $title, 150);
        self::footer($c, $sub);
    }

    /** Čistá mriežka — 2 stĺpce, jedno políčko patrí textu. */
    private static function renderGrid(ImageManager $m, ImageInterface $c, array $photos, string $title, ?string $sub): void
    {
        foreach (self::slots('grid') as $i => [$x, $y, $w, $h, $tilt]) {
            if (! empty($photos[$i])) {
                self::place($m, $c, $photos[$i], $x, $y, $w, $h, $tilt, 0);
            }
        }

        // Textové políčko je štvrté v mriežke 3×2 — medzi fotkami, nie nad nimi
        $pad = 40;
        $gap = 12;
        $cell = (int) ((self::W - 2 * $pad - $gap) / 2);
        $tx = $pad + ($cell + $gap);
        $ty = 300 + ($cell + $gap);

        $c->drawRectangle(function ($rect) use ($cell, $tx, $ty) {
            $rect->at($tx, $ty);
            $rect->size($cell, $cell);
            $rect->background(CollageBuilder::GREEN);
        });
        self::centeredText($c, $title, $tx + $cell / 2, $ty + $cell / 2 - 10, 58, self::PAPER, 'caveat');
        if ($sub) {
            self::centeredText($c, $sub, $tx + $cell / 2, $ty + $cell / 2 + 60, 22, self::PAPER, 'inter');
        }

        self::brand($c, self::H - 120);
    }

    /** Polaroidy prilepené páskou. */
    private static function renderTape(ImageManager $m, ImageInterface $c, array $photos, string $title, ?string $sub): void
    {
        foreach (self::slots('tape') as $i => [$x, $y, $w, $h, $tilt]) {
            if (empty($photos[$i])) {
                continue;
            }
            self::place($m, $c, $photos[$i], $x, $y, $w, $h, $tilt, 30);
            // Páska sedí na hornej hrane, mierne pootočená oproti fotke
            self::tape($m, $c, (int) ($x + $w / 2), $y - 8, (int) ($w * 0.42), $tilt * 4, $i);
        }

        self::title($c, $title, 180);
        self::footer($c, $sub);
    }

    /** Fotky rozsypané do tvaru srdca. */
    private static function renderHeart(ImageManager $m, ImageInterface $c, array $photos, string $title, ?string $sub): void
    {
        foreach (self::slots('heart') as $i => [$x, $y, $w, $h, $tilt]) {
            if (empty($photos[$i])) {
                continue;
            }
            self::place($m, $c, $photos[$i], $x, $y, $w, $h, $tilt, 14);
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

        [$px, $py, $pw, $ph] = self::slots('player')[0];
        self::place($m, $c, $photos[0], $px, $py, $pw, $ph, 0, 0);

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
        foreach (self::slots('calendar') as $i => [$x, $y, $w, $h, $tilt]) {
            if (! empty($photos[$i])) {
                self::place($m, $c, $photos[$i], $x, $y, $w, $h, $tilt, 0);

                continue;
            }

            // Prázdny deň — tlmené políčko, nech je vidieť rytmus mesiaca
            $c->drawRectangle(function ($rect) use ($w, $h, $x, $y) {
                $rect->at($x, $y);
                $rect->size($w, $h);
                $rect->background('#eef2ee');
            });
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
