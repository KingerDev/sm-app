<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    private const EDITABLE = ['together_since', 'total_photos', 'total_km', 'mascot_variant'];

    public function index(): JsonResponse
    {
        return response()->json(
            DB::table('settings')->pluck('value', 'key')
        );
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key'   => 'required|string|in:'.implode(',', self::EDITABLE),
            'value' => 'nullable|string|max:255',
        ]);

        DB::table('settings')->updateOrInsert(
            ['key' => $data['key']],
            ['value' => $data['value'], 'updated_at' => now()]
        );

        return response()->json(
            DB::table('settings')->pluck('value', 'key')
        );
    }
}
