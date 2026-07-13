<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            WishlistItem::orderBy('sort_order')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'flag' => 'nullable|string|max:10',
            'note' => 'nullable|string|max:255',
        ]);

        $data['sort_order'] = (WishlistItem::max('sort_order') ?? 0) + 1;

        return response()->json(WishlistItem::create($data), 201);
    }

    public function destroy(int $id): JsonResponse
    {
        WishlistItem::findOrFail($id)->delete();

        return response()->json(null, 204);
    }
}
