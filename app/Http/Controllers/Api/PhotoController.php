<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Capsule;
use App\Models\Moment;
use App\Models\Photo;
use App\Support\Images;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PhotoController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type'     => 'required|in:moment,capsule',
            'id'       => 'required|integer',
            'files'    => 'required|array|min:1',
            'files.*'  => 'file|image|max:40960',
            'taken_at' => 'nullable|date',
        ]);

        $parent = $data['type'] === 'moment'
            ? Moment::findOrFail($data['id'])
            : Capsule::findOrFail($data['id']);

        $maxSort = $parent->photos()->max('sort_order') ?? 0;

        $photos = collect($request->file('files'))->values()->map(function ($file, $i) use ($parent, $data, $maxSort) {
            // Optimalizácia: WebP max 2560 px + miniatúra (z ~25 MB ostane ~1 MB)
            $stored = Images::store($file, $data['type'] === 'moment' ? 'photos/moments' : 'photos/capsules');

            return $parent->photos()->create([
                ...$stored,
                'taken_at'   => $data['taken_at'] ?? null,
                'sort_order' => $maxSort + $i + 1,
            ]);
        });

        $this->syncCounts($parent);

        return response()->json($photos->values(), 201);
    }

    public function togglePin(int $id): JsonResponse
    {
        $photo = Photo::findOrFail($id);
        $photo->update(['is_pinned' => ! $photo->is_pinned]);

        $this->syncCounts($photo->photoable);

        return response()->json($photo);
    }

    /**
     * Nastaví fotku ako titulnú (cover) — ostatným fotkám momentu/kapsuly sa zruší.
     * Voliteľný `file` je orezaný výrez z editora — uloží sa samostatne,
     * originál fotky zostáva nedotknutý.
     */
    public function setCover(Request $request, int $id): JsonResponse
    {
        $request->validate(['file' => 'nullable|file|image|max:40960']);

        $photo = Photo::findOrFail($id);

        // ostatné fotky prídu o cover aj o uložený výrez
        Photo::where('photoable_type', $photo->photoable_type)
            ->where('photoable_id', $photo->photoable_id)
            ->where('id', '!=', $photo->id)
            ->where(fn ($q) => $q->where('is_cover', true)->orWhereNotNull('cover_path'))
            ->get()
            ->each(function (Photo $other) {
                Images::delete($other->cover_path, $other->cover_thumb_path);
                $other->update(['is_cover' => false, 'cover_path' => null, 'cover_thumb_path' => null]);
            });

        $data = ['is_cover' => true];

        if ($file = $request->file('file')) {
            Images::delete($photo->cover_path, $photo->cover_thumb_path);
            $stored = Images::store($file, 'photos/covers');
            $data['cover_path'] = $stored['path'];
            $data['cover_thumb_path'] = $stored['thumb_path'];
        }

        $photo->update($data);

        return response()->json($photo);
    }

    public function destroy(int $id): JsonResponse
    {
        $photo = Photo::findOrFail($id);
        $parent = $photo->photoable;

        $photo->delete(); // súbory zmaže model event

        $this->syncCounts($parent);

        return response()->json(null, 204);
    }

    private function syncCounts(Moment|Capsule $parent): void
    {
        $parent->update([
            'photos_count' => $parent->photos()->count(),
            ...($parent instanceof Moment
                ? ['pinned_count' => $parent->photos()->where('is_pinned', true)->count()]
                : []),
        ]);
    }
}
