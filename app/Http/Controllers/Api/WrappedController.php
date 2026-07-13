<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonthlyWrapped;
use Illuminate\Http\JsonResponse;

class WrappedController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            MonthlyWrapped::orderBy('sort_order')->get()
        );
    }

    public function show(string $wrappedId): JsonResponse
    {
        return response()->json(
            MonthlyWrapped::where('wrapped_id', $wrappedId)->firstOrFail()
        );
    }
}
