<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Support\Images;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Momentky („chvíľky") — mikro-poznámky z bežných dní. */
class NoteController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Note::orderByDesc('date')->orderByDesc('id')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'text' => 'required|string|max:2000',
            'who'  => 'nullable|in:S,M,spolu',
            'date' => 'nullable|date',
            'file' => 'nullable|file|image|max:40960',
        ]);

        $note = new Note([
            'text' => $data['text'],
            'who'  => $data['who'] ?? 'spolu',
            'date' => $data['date'] ?? now()->toDateString(),
        ]);

        if ($file = $request->file('file')) {
            $stored = Images::store($file, 'photos/notes');
            $note->photo_path = $stored['path'];
            $note->photo_thumb_path = $stored['thumb_path'];
        }

        $note->save();

        return response()->json($note, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'text' => 'required|string|max:2000',
            'who'  => 'nullable|in:S,M,spolu',
            'date' => 'nullable|date',
            'file' => 'nullable|file|image|max:40960',
            'remove_photo' => 'nullable|boolean',
        ]);

        $note = Note::findOrFail($id);
        $note->fill([
            'text' => $data['text'],
            'who'  => $data['who'] ?? $note->who,
            'date' => $data['date'] ?? $note->date,
        ]);

        if ($file = $request->file('file')) {
            Images::delete($note->photo_path, $note->photo_thumb_path);
            $stored = Images::store($file, 'photos/notes');
            $note->photo_path = $stored['path'];
            $note->photo_thumb_path = $stored['thumb_path'];
        } elseif ($request->boolean('remove_photo')) {
            Images::delete($note->photo_path, $note->photo_thumb_path);
            $note->photo_path = null;
            $note->photo_thumb_path = null;
        }

        $note->save();

        return response()->json($note);
    }

    public function destroy(int $id): JsonResponse
    {
        Note::findOrFail($id)->delete(); // súbory zmaže model event

        return response()->json(null, 204);
    }
}
