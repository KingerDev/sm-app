<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collage;
use App\Models\CollageGift;
use App\Models\User;
use App\Support\SkDate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Darčeky — koláž poslaná tomu druhému.
 *
 * Appka je pre dvoch, takže príjemcu netreba vyberať: je to ten druhý účet.
 * Keby ich raz bolo viac, prvý ďalší je stále lepší predvolený než nič.
 */
class GiftController extends Controller
{
    /** Prijaté aj odoslané — odosielateľ chce vidieť, či to už ten druhý otvoril. */
    public function index(Request $request): JsonResponse
    {
        $me = $request->user();

        $gifts = CollageGift::with(['collage', 'from', 'to'])
            ->where('to_user_id', $me->id)
            ->orWhere('from_user_id', $me->id)
            ->latest()
            ->get()
            ->map(fn (CollageGift $g) => self::present($g, $me->id));

        return response()->json($gifts);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'collage_id' => 'required|integer|exists:collages,id',
            'note' => 'nullable|string|max:200',
        ]);

        $me = $request->user();
        $other = User::where('id', '!=', $me->id)->orderBy('id')->first();

        if (! $other) {
            return response()->json(['message' => 'Nie je komu darček poslať.'], 422);
        }

        $gift = CollageGift::create([
            'collage_id' => $data['collage_id'],
            'from_user_id' => $me->id,
            'to_user_id' => $other->id,
            'note' => $data['note'] ?? null,
        ]);

        return response()->json(self::present($gift->load(['collage', 'from', 'to']), $me->id), 201);
    }

    /** Otvorenie hlási len príjemca — odosielateľ si darček pozerá bez toho. */
    public function open(Request $request, int $id): JsonResponse
    {
        $me = $request->user();
        $gift = CollageGift::with(['collage', 'from', 'to'])->findOrFail($id);

        if ($gift->to_user_id !== $me->id) {
            throw new NotFoundHttpException('Tento darček nie je pre teba.');
        }

        if (! $gift->opened_at) {
            $gift->update(['opened_at' => now()]);
        }

        return response()->json(self::present($gift, $me->id));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $gift = CollageGift::findOrFail($id);

        if ($gift->from_user_id !== $request->user()->id) {
            throw new NotFoundHttpException('Zrušiť darček môže len ten, kto ho poslal.');
        }

        $gift->delete();

        return response()->json(null, 204);
    }

    private static function present(CollageGift $g, int $meId): array
    {
        return [
            'id' => $g->id,
            // `sent` odlišuje pohľad odosielateľa — tomu sa obálka neotvára
            'sent' => $g->from_user_id === $meId,
            'opened' => (bool) $g->opened_at,
            'from' => $g->from?->name,
            'to' => $g->to?->name,
            'note' => $g->note,
            'date_short' => SkDate::short($g->created_at),
            'collage' => $g->collage,
        ];
    }
}
