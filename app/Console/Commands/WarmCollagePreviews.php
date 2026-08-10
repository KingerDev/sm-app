<?php

namespace App\Console\Commands;

use App\Models\Moment;
use App\Models\Photo;
use App\Support\CollageBuilder;
use Illuminate\Console\Command;

/**
 * Pripraví ukážky dizajnov dopredu.
 *
 * Bez toho čaká prvý používateľ po nasadení na ich vygenerovanie — srdce z 27
 * fotiek trvá aj deväť sekúnd. Vhodné pustiť ako post-deployment príkaz.
 */
class WarmCollagePreviews extends Command
{
    protected $signature = 'collage:warm';

    protected $description = 'Vygeneruje ukážky všetkých dizajnov koláží dopredu';

    public function handle(): int
    {
        foreach (array_keys(CollageBuilder::TEMPLATES) as $key) {
            $paths = Photo::where('photoable_type', Moment::class)
                ->where('kind', 'image')
                ->orderBy('id')
                ->limit(CollageBuilder::TEMPLATES[$key])
                ->pluck('path')
                ->all();

            if (! $paths) {
                $this->warn("  {$key} — žiadne fotky, preskakujem");

                continue;
            }

            $t0 = microtime(true);
            $path = CollageBuilder::make(
                $paths,
                'ukážka',
                'takto to bude vyzerať',
                $key,
                CollageBuilder::sampleCaptions($key),
            );

            $this->line(sprintf(
                '  %-10s %s  %.1fs',
                $key,
                $path ? 'hotovo' : 'ZLYHALO',
                microtime(true) - $t0
            ));
        }

        return self::SUCCESS;
    }
}
