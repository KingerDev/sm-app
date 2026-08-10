<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collage;
use App\Models\Moment;
use App\Models\Photo;
use App\Support\CollageBuilder;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CollageController extends Controller
{
    /** Uložené koláže, od najnovšej. */
    public function index(): JsonResponse
    {
        return response()->json(Collage::latest()->get());
    }

    /** Zoznam dostupných šablón aj s počtom fotiek, ktoré využijú. */
    public function templates(): JsonResponse
    {
        $labels = [
            'polaroid' => 'Rozsypané fotky',
            'grid' => 'Mriežka',
            'tape' => 'Nalepené páskou',
            'heart' => 'Srdce z fotiek',
            'heartfill' => 'Srdce (výplň)',
            'player' => 'Prehrávač',
            'calendar' => 'Kalendár mesiaca',
        ];

        return response()->json(
            collect(CollageBuilder::TEMPLATES)
                ->map(fn (int $count, string $key) => [
                    'key' => $key,
                    'label' => $labels[$key] ?? $key,
                    'photos' => $count,
                    // Rozloženie políčok pre náhľad v appke (pomer 0–1)
                    'slots' => CollageBuilder::slotsNormalized($key),
                ])
                ->values()
        );
    }

    /**
     * Ukážka dizajnu z vlastných fotiek — aby bolo v prehľade vidieť, ako bude
     * koláž naozaj vyzerať. Generuje sa na požiadanie a zvlášť pre každý dizajn;
     * všetkých sedem naraz by prvé otvorenie zdržalo o desiatky sekúnd.
     */
    public function preview(string $key): JsonResponse
    {
        if (! isset(CollageBuilder::TEMPLATES[$key])) {
            throw new NotFoundHttpException("Dizajn {$key} neexistuje.");
        }

        // Zámerne najstaršie fotky — výber sa tak nemení pri každom nahratí
        // a ukážka sa negeneruje znova.
        $paths = Photo::where('photoable_type', Moment::class)
            ->where('kind', 'image')
            ->orderBy('id')
            ->limit(CollageBuilder::TEMPLATES[$key])
            ->pluck('path')
            ->all();

        if (! $paths) {
            return response()->json(['url' => null]);
        }

        $path = CollageBuilder::make($paths, 'ukážka', 'takto to bude vyzerať', $key);

        return response()->json([
            'url' => $path ? Storage::disk(config('filesystems.media'))->url($path) : null,
        ]);
    }

    /**
     * Vytvorí koláž. Fotky sa berú z momentu alebo z mesiaca; ak sa pošlú
     * priamo `photo_ids`, majú prednosť.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'template' => ['required', Rule::in(array_keys(CollageBuilder::TEMPLATES))],
            'title' => 'required|string|max:60',
            'subtitle' => 'nullable|string|max:80',
            'source_type' => 'required|in:moment,month,photos',
            'source_id' => 'nullable|string|max:255',
            'photo_ids' => 'nullable|array|max:30',
            'photo_ids.*' => 'nullable|integer',
        ]);

        $paths = self::pickPhotos($data);

        if (! $paths) {
            return response()->json(['message' => 'Pre tento výber sa nenašli žiadne fotky.'], 422);
        }

        $path = CollageBuilder::make($paths, $data['title'], $data['subtitle'] ?? null, $data['template']);

        if (! $path) {
            return response()->json(['message' => 'Koláž sa nepodarilo vytvoriť.'], 500);
        }

        $collage = Collage::create([
            'template' => $data['template'],
            'title' => $data['title'],
            'subtitle' => $data['subtitle'] ?? null,
            'path' => $path,
            'photos_count' => count($paths),
            'source_type' => $data['source_type'],
            'source_id' => $data['source_id'] ?? null,
        ]);

        return response()->json($collage, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        Collage::findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    /** @return string[] */
    private static function pickPhotos(array $data): array
    {
        if (! empty($data['photo_ids'])) {
            // Pozícia v poli = políčko šablóny, preto sa poradie musí zachovať
            // presne (databáza by vrátila svoje) a prázdne miesta musia ostať
            // prázdne — inak by sa fotka z posledného políčka posunula na prvé.
            $byId = Photo::whereIn('id', array_filter($data['photo_ids']))
                ->where('kind', 'image')
                ->pluck('path', 'id');

            return collect($data['photo_ids'])
                ->map(fn ($id) => $id ? ($byId[$id] ?? null) : null)
                ->all();
        }

        $query = Photo::where('photoable_type', Moment::class)->where('kind', 'image');

        if ($data['source_type'] === 'moment') {
            $moment = Moment::where('slug', $data['source_id'])->first();
            if (! $moment) {
                return [];
            }
            $query->where('photoable_id', $moment->id);
        } elseif ($data['source_type'] === 'month') {
            // source_id je "RRRR-MM"
            $start = rescue(
                fn () => Carbon::createFromFormat('Y-m-d', $data['source_id'].'-01')->startOfMonth(),
                null,
                false
            );
            if (! $start) {
                return [];
            }
            $ids = Moment::whereBetween('date_start', [
                $start->toDateString(),
                $start->copy()->endOfMonth()->toDateString(),
            ])->pluck('id');

            if ($ids->isEmpty()) {
                return [];
            }
            $query->whereIn('photoable_id', $ids);
        }

        return $query
            ->orderByDesc('is_pinned')
            ->orderByDesc('is_cover')
            ->orderBy('sort_order')
            ->limit(CollageBuilder::TEMPLATES[$data['template']])
            ->pluck('path')
            ->all();
    }
}
