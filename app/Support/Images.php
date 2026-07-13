<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

/**
 * Optimalizácia fotiek pri uploade — 25MB fotka z mobilu sa uloží ako
 * WebP ~0,5–1,5 MB (max 2560 px) + miniatúra ~400 px pre mriežky.
 * EXIF rotácia sa aplikuje automaticky pri dekódovaní.
 */
class Images
{
    private const MAX_DIMENSION = 2560;
    private const MAX_QUALITY = 82;
    private const THUMB_DIMENSION = 480;
    private const THUMB_QUALITY = 75;

    /**
     * Spracuje nahratú fotku do $dir na public disku.
     * Vracia ['path' => ..., 'thumb_path' => ...].
     */
    public static function store(UploadedFile $file, string $dir): array
    {
        $manager = new ImageManager(new GdDriver());
        $image = $manager->decodePath($file->getRealPath());

        $base = Str::uuid()->toString();
        $path = "{$dir}/{$base}.webp";
        $thumbPath = "{$dir}/{$base}-thumb.webp";

        Storage::disk('public')->put(
            $path,
            (string) $image->scaleDown(self::MAX_DIMENSION, self::MAX_DIMENSION)
                ->encode(new WebpEncoder(quality: self::MAX_QUALITY))
        );

        Storage::disk('public')->put(
            $thumbPath,
            (string) $image->scaleDown(self::THUMB_DIMENSION, self::THUMB_DIMENSION)
                ->encode(new WebpEncoder(quality: self::THUMB_QUALITY))
        );

        return ['path' => $path, 'thumb_path' => $thumbPath];
    }

    public static function delete(?string ...$paths): void
    {
        foreach (array_filter($paths) as $path) {
            Storage::disk('public')->delete($path);
        }
    }
}
