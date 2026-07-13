<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BucketItem;
use App\Models\Country;
use App\Models\Moment;
use App\Models\MonthlyWrapped;
use App\Models\Photo;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $togetherSince = DB::table('settings')->where('key', 'together_since')->value('value');
        $totalPhotos   = (int) DB::table('settings')->where('key', 'total_photos')->value('value');
        $totalKm       = (int) DB::table('settings')->where('key', 'total_km')->value('value');

        $daysTogether = $togetherSince
            ? abs((int) now()->startOfDay()->diffInDays(\Carbon\Carbon::parse($togetherSince)->startOfDay()))
            : 0;

        $countries = Country::orderBy('sort_order')->get();

        $topMonth = MonthlyWrapped::orderByDesc('photos_count')->first();

        $bucketDone  = BucketItem::where('is_done', true)->count();
        $bucketTotal = BucketItem::count();

        return response()->json([
            'days_together' => $daysTogether,
            'together_since' => $togetherSince,
            // základ zo settings (napr. archív pred appkou) + reálne nahraté fotky
            'photos'         => $totalPhotos + Photo::count(),
            'km'             => $totalKm,
            'countries'      => $countries->count(),
            'cities'         => $countries->sum('cities_count'),
            'bucket_done'    => $bucketDone,
            'bucket_total'   => $bucketTotal,
            'top_month'      => $topMonth ? [
                'name'   => $topMonth->month,
                'short'  => $topMonth->short,
                'photos' => $topMonth->photos_count,
            ] : null,
        ]);
    }
}
