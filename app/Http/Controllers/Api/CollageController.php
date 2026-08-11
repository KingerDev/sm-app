<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Koláže sa skladajú v appke — editor ukazuje živý náhľad, ktorý sa mení pri
 * každom ťahu posuvníkom, a hotový obrázok sa odfotí z toho istého komponentu.
 * Server ho už len prevezme a uloží; keby ho kreslil znova, existovali by dve
 * implementácie toho istého rozloženia a časom by sa rozišli.
 */
class CollageController extends Controller
{
    /** Uložené koláže, od najnovšej. */
    public function index(): JsonResponse
    {
        return response()->json(Collage::latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = self::validated($request);

        $collage = Collage::create([
            'template' => $data['layout'],
            'format' => $data['format'],
            'title' => $data['title'],
            'subtitle' => $data['subtitle'] ?? null,
            'config' => isset($data['config']) ? json_decode($data['config'], true) : null,
            'path' => self::storeImage($request),
            'photos_count' => $data['photos_count'],
            'source_type' => $data['source_type'],
            'source_id' => $data['source_id'] ?? null,
        ]);

        return response()->json($collage, 201);
    }

    /**
     * Prepíše koláž novou verziou. Obrázok sa nahradí a ten starý sa zmaže —
     * po úprave už na nič neodkazuje a na R2 by len zaberal miesto.
     *
     * Ide cez POST, nie PATCH: PHP v PATCH požiadavke súbory nespracuje.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $collage = Collage::findOrFail($id);
        $data = self::validated($request);
        $old = $collage->path;

        $collage->update([
            'template' => $data['layout'],
            'format' => $data['format'],
            'title' => $data['title'],
            'subtitle' => $data['subtitle'] ?? null,
            'config' => isset($data['config']) ? json_decode($data['config'], true) : null,
            'path' => self::storeImage($request),
            'photos_count' => $data['photos_count'],
        ]);

        if ($old !== $collage->path && ! Collage::where('path', $old)->exists()) {
            Storage::disk(config('filesystems.media'))->delete($old);
        }

        return response()->json($collage);
    }

    private static function validated(Request $request): array
    {
        return $request->validate([
            'image' => 'required|image|max:12288',
            'title' => 'required|string|max:60',
            'subtitle' => 'nullable|string|max:80',
            // Rozloženie a formát držíme aj zvlášť — zoznam podľa nich vykreslí
            // správny pomer strán bez rozbaľovania celého nastavenia
            'layout' => 'required|string|max:20',
            'format' => 'required|string|max:12',
            'photos_count' => 'required|integer|min:1|max:9',
            // Cez multipart chodí nastavenie ako reťazec, nie ako pole
            'config' => 'nullable|json',
            'source_type' => 'required|in:moment,month,photos',
            'source_id' => 'nullable|string|max:255',
        ]);
    }

    private static function storeImage(Request $request): string
    {
        $path = 'collages/'.Str::uuid()->toString().'.jpg';

        Storage::disk(config('filesystems.media'))->put(
            $path,
            file_get_contents($request->file('image')->getRealPath()),
        );

        return $path;
    }

    public function destroy(int $id): JsonResponse
    {
        Collage::findOrFail($id)->delete();

        return response()->json(null, 204);
    }
}
