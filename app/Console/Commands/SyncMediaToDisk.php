<?php

namespace App\Console\Commands;

use App\Models\Capsule;
use App\Models\Note;
use App\Models\Photo;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Prekopíruje všetky médiá na cieľový disk (typicky Cloudflare R2).
 *
 * Zdrojom môže byť lokálny disk alebo bežiaci web — vďaka --from-url sa dajú
 * súbory stiahnuť priamo z produkcie bez SSH prístupu k nej.
 *
 * Príklady:
 *   php artisan media:sync s3 --from-url=https://sm-app.kinger.dev --dry-run
 *   php artisan media:sync s3 --from-url=https://sm-app.kinger.dev
 *   php artisan media:sync s3 --from-disk=public
 */
class SyncMediaToDisk extends Command
{
    protected $signature = 'media:sync
        {target : Cieľový disk (napr. s3)}
        {--from-disk= : Zdrojový disk, ak sú súbory lokálne}
        {--from-url= : Základná URL, odkiaľ sa súbory stiahnu (napr. https://example.sk)}
        {--dry-run : Len vypíše, čo by sa prenieslo}';

    protected $description = 'Prekopíruje fotky, videá a audio na iný disk (napr. R2)';

    public function handle(): int
    {
        $target = $this->argument('target');
        $fromDisk = $this->option('from-disk');
        $fromUrl = rtrim((string) $this->option('from-url'), '/');
        $dry = (bool) $this->option('dry-run');

        if (! $fromDisk && ! $fromUrl) {
            $this->error('Zadaj --from-disk alebo --from-url.');

            return self::FAILURE;
        }

        try {
            $to = Storage::disk($target);
        } catch (\Throwable $e) {
            $this->error("Cieľový disk `{$target}` sa nedá otvoriť: {$e->getMessage()}");

            return self::FAILURE;
        }

        $paths = $this->collectPaths();
        $this->info(sprintf('Nájdených %d súborov na prenos do disku `%s`.', count($paths), $target));

        if ($dry) {
            $this->warn('Skúšobný beh — nič sa nezapisuje.');
        }

        $copied = $skipped = 0;
        $failed = [];
        $bar = $this->output->createProgressBar(count($paths));
        $bar->start();

        foreach ($paths as $path) {
            $bar->advance();

            if ($to->exists($path)) {
                $skipped++;

                continue;
            }

            if ($dry) {
                $copied++;

                continue;
            }

            try {
                $bytes = $fromDisk
                    ? Storage::disk($fromDisk)->get($path)
                    : $this->fetch("{$fromUrl}/storage/{$path}");

                if ($bytes === null || $bytes === '') {
                    $failed[$path] = 'prázdna odpoveď';

                    continue;
                }

                $to->put($path, $bytes);
                $copied++;
            } catch (\Throwable $e) {
                $failed[$path] = $e->getMessage();
            }
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Prenesené: {$copied}");
        $this->line("Preskočené (už na cieli): {$skipped}");

        if ($failed) {
            $this->newLine();
            $this->error('Zlyhalo: '.count($failed));
            foreach (array_slice($failed, 0, 10, true) as $path => $why) {
                $this->line("  {$path} — {$why}");
            }
            if (count($failed) > 10) {
                $this->line('  … a ďalších '.(count($failed) - 10));
            }

            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    /** Všetky cesty k médiám naprieč modelmi, bez duplicít a prázdnych hodnôt. */
    private function collectPaths(): array
    {
        $paths = [];

        Photo::query()
            ->select(['path', 'thumb_path', 'cover_path', 'cover_thumb_path', 'poster_path', 'poster_thumb_path'])
            ->chunk(500, function ($rows) use (&$paths) {
                foreach ($rows as $row) {
                    array_push(
                        $paths,
                        $row->path, $row->thumb_path,
                        $row->cover_path, $row->cover_thumb_path,
                        $row->poster_path, $row->poster_thumb_path,
                    );
                }
            });

        Note::query()->select(['photo_path', 'photo_thumb_path'])->chunk(500, function ($rows) use (&$paths) {
            foreach ($rows as $row) {
                array_push($paths, $row->photo_path, $row->photo_thumb_path);
            }
        });

        Capsule::query()->select(['audio_path'])->chunk(500, function ($rows) use (&$paths) {
            foreach ($rows as $row) {
                $paths[] = $row->audio_path;
            }
        });

        return array_values(array_unique(array_filter($paths)));
    }

    private function fetch(string $url): ?string
    {
        $ctx = stream_context_create(['http' => ['timeout' => 30, 'ignore_errors' => true]]);
        $body = @file_get_contents($url, false, $ctx);

        // $http_response_header nastaví PHP až po volaní file_get_contents
        $status = 0;
        foreach ($http_response_header ?? [] as $header) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $header, $m)) {
                $status = (int) $m[1];
            }
        }

        if ($status !== 200) {
            throw new \RuntimeException("HTTP {$status}");
        }

        return $body === false ? null : $body;
    }
}
