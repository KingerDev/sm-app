<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\Moment;
use App\Support\Places;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    public function index(): JsonResponse
    {
        $moments = Moment::withCount('photos')->get()->keyBy('slug');

        return response()->json(
            Country::orderBy('sort_order')->get()
                ->map(fn (Country $c) => Places::present($c, $moments))
        );
    }

    /** Nová krajina — súradnice a vlajka sa doplnia geokódovaním. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:80',
            'flag' => 'nullable|string|max:10',
            'city' => 'nullable|string|max:80',
        ]);

        if (Places::findCountry($data['name'])) {
            return response()->json(['message' => 'Táto krajina už na mape je.'], 422);
        }

        $country = Places::ensureCountry($data['name'], $data['flag'] ?? null);

        if (filled($data['city'] ?? null)) {
            $country = Places::ensureCity($country, $data['city']);
        }

        return response()->json(Places::present($country), 201);
    }

    public function destroy(int $id): JsonResponse
    {
        Country::findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    /** Nové mesto v krajine. */
    public function storeCity(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:80',
        ]);

        $country = Country::findOrFail($id);
        $exists = collect($country->cities ?? [])
            ->contains(fn ($c) => mb_strtolower($c['name']) === mb_strtolower(trim($data['name'])));

        if ($exists) {
            return response()->json(['message' => 'Toto mesto už v krajine je.'], 422);
        }

        $country = Places::ensureCity($country, $data['name']);

        return response()->json(Places::present($country), 201);
    }

    public function destroyCity(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:80',
        ]);

        $country = Country::findOrFail($id);
        $cities = collect($country->cities ?? [])
            ->reject(fn ($c) => mb_strtolower($c['name']) === mb_strtolower(trim($data['name'])))
            ->values()
            ->all();

        $country->update(['cities' => $cities, 'cities_count' => count($cities)]);

        return response()->json(Places::present($country->refresh()));
    }
}
