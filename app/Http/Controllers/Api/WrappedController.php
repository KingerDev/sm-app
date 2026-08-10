<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Moment;
use App\Models\Photo;
use App\Support\CollageBuilder;
use App\Support\WrappedBuilder;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class WrappedController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(WrappedBuilder::all()->values());
    }

    public function show(string $wrappedId): JsonResponse
    {
        $wrapped = WrappedBuilder::find($wrappedId);

        if (! $wrapped) {
            throw new NotFoundHttpException("Wrapped {$wrappedId} neexistuje.");
        }

        return response()->json($wrapped);
    }

    /** Koláž za jeden mesiac — formát story, pripravená na zdieľanie. */
    public function collage(string $wrappedId): JsonResponse
    {
        $wrapped = WrappedBuilder::find($wrappedId);

        if (! $wrapped) {
            throw new NotFoundHttpException("Wrapped {$wrappedId} neexistuje.");
        }

        $start = Carbon::createFromFormat('Y-m-d', $wrappedId.'-01')->startOfMonth();

        return $this->render(
            self::bestPhotos($start, $start->copy()->endOfMonth()),
            $wrapped['label'],
            $wrapped['photos_count'].' fotiek · '.$wrapped['headline'],
        );
    }

    /** Koláž za celý rok — pre ročný Wrapped. */
    public function yearCollage(int $year): JsonResponse
    {
        $start = Carbon::create($year, 1, 1)->startOfDay();

        return $this->render(
            self::bestPhotos($start, $start->copy()->endOfYear()),
            "náš rok {$year}",
            'S+M Wrapped',
        );
    }

    private function render(array $paths, string $title, ?string $subtitle): JsonResponse
    {
        $key = CollageBuilder::make($paths, $title, $subtitle);

        return response()->json([
            'url' => $key ? Storage::disk(config('filesystems.media'))->url($key) : null,
            'photos' => count($paths),
        ]);
    }

    /**
     * Fotky do koláže: len z momentov v danom období, pripnuté majú prednosť.
     * Videá vynechávame — poster býva menej vydarený než skutočná fotka.
     *
     * @return string[]
     */
    private static function bestPhotos(Carbon $from, Carbon $to): array
    {
        $momentIds = Moment::whereBetween('date_start', [$from->toDateString(), $to->toDateString()])->pluck('id');

        if ($momentIds->isEmpty()) {
            return [];
        }

        return Photo::where('photoable_type', Moment::class)
            ->whereIn('photoable_id', $momentIds)
            ->where('kind', 'image')
            ->orderByDesc('is_pinned')
            ->orderByDesc('is_cover')
            ->orderBy('sort_order')
            ->limit(4)
            ->pluck('path')
            ->all();
    }
}
