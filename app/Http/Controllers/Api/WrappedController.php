<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\WrappedBuilder;
use Illuminate\Http\JsonResponse;
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
}
