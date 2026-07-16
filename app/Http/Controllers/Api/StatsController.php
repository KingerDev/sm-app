<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BucketItem;
use App\Models\Country;
use App\Models\Moment;
use App\Models\Photo;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $togetherSince = DB::table('settings')->where('key', 'together_since')->value('value');
        $totalPhotos   = (int) DB::table('settings')->where('key', 'total_photos')->value('value');

        $daysTogether = $togetherSince
            ? abs((int) now()->startOfDay()->diffInDays(\Carbon\Carbon::parse($togetherSince)->startOfDay()))
            : 0;

        $countries = Country::orderBy('sort_order')->get();

        // Mesiac s najviac fotkami — z reálnych momentov (podľa dátumu momentu, nie uploadu)
        $byMonth = Moment::where('photos_count', '>', 0)
            ->get(['date_start', 'photos_count'])
            ->groupBy(fn (Moment $m) => $m->date_start->format('Y-m'))
            ->map(fn ($group) => $group->sum('photos_count'))
            ->sortDesc();

        $topMonth = null;
        if ($byMonth->isNotEmpty()) {
            $d = \Carbon\Carbon::createFromFormat('Y-m', $byMonth->keys()->first());
            $topMonth = [
                'name'   => \App\Support\SkDate::MONTHS[$d->month],
                'short'  => \App\Support\SkDate::short($d),
                'photos' => $byMonth->first(),
            ];
        }

        $bucketDone  = BucketItem::where('is_done', true)->count();
        $bucketTotal = BucketItem::count();

        return response()->json([
            'days_together' => $daysTogether,
            'together_since' => $togetherSince,
            // základ zo settings (napr. archív pred appkou) + reálne nahraté fotky
            'photos'         => $totalPhotos + Photo::count(),
            'countries'      => $countries->count(),
            'cities'         => $countries->sum('cities_count'),
            'bucket_done'    => $bucketDone,
            'bucket_total'   => $bucketTotal,
            'top_month'      => $topMonth,
        ]);
    }
}
