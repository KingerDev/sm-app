<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Capsule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CapsuleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Capsule::with('photos')->orderBy('unlock_date')->get()->map($this->present(...))
        );
    }

    public function show(string $slug): JsonResponse
    {
        return response()->json(
            $this->present(Capsule::with('photos')->where('slug', $slug)->firstOrFail())
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'          => 'required|string|max:120',
            'by'             => 'required|string|max:10',
            'created_date'   => 'nullable|date',
            'unlock_date'    => 'required|date|after:today',
            'has_letter'     => 'boolean',
            'letter'         => 'nullable|string|max:10000',
            'photos_count'   => 'integer|min:0',
            'audio_duration' => 'nullable|string|max:10',
            'seed'           => 'nullable|string|max:50',
            'note'           => 'nullable|string|max:500',
            'preview'        => 'nullable|string|max:300',
            'audio'          => 'nullable|file|mimetypes:audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/webm,audio/ogg|max:20480',
        ]);

        $slug = Str::slug($data['title']);
        $base = $slug ?: 'kapsula';
        $slug = $base;
        $i = 2;
        while (Capsule::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        if ($request->hasFile('audio')) {
            $data['audio_path'] = $request->file('audio')->store('audio/capsules', 'public');
        }
        unset($data['audio']);

        $data['slug']         = $slug;
        $data['created_date'] = $data['created_date'] ?? now()->toDateString();
        $data['has_letter']   = filled($data['letter'] ?? null);
        $data['preview']      = $data['preview'] ?? Str::limit($data['letter'] ?? '', 80);
        $data['seed']         = $data['seed'] ?? 'home';
        $data['sort_order']   = (Capsule::max('sort_order') ?? 0) + 1;

        $capsule = Capsule::create($data);

        return response()->json($this->present($capsule->load('photos')), 201);
    }

    public function destroy(string $slug): JsonResponse
    {
        Capsule::where('slug', $slug)->firstOrFail()->delete();
        return response()->json(null, 204);
    }

    /**
     * Zamknutá kapsula nesmie prezradiť list, fotky ani audio —
     * odomkne sa až po unlock_date.
     */
    private function present(Capsule $capsule): array
    {
        $data = $capsule->toArray();
        $data['is_unlocked'] = $capsule->unlock_date->isPast() || $capsule->unlock_date->isToday();

        if (! $data['is_unlocked']) {
            $data['letter'] = null;
            $data['audio_url'] = null;
            $data['photos'] = [];
        }

        return $data;
    }
}
