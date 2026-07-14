<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BucketController;
use App\Http\Controllers\Api\CapsuleController;
use App\Http\Controllers\Api\CountryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\MomentController;
use App\Http\Controllers\Api\PhotoController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\WrappedController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/user', [AuthController::class, 'user']);

        Route::get('/stats', [StatsController::class, 'index']);

        Route::get('/settings', [SettingsController::class, 'index']);
        Route::patch('/settings', [SettingsController::class, 'update']);

        Route::get('/moments', [MomentController::class, 'index']);
        Route::post('/moments', [MomentController::class, 'store']);
        Route::get('/moments/{slug}', [MomentController::class, 'show']);
        Route::patch('/moments/{slug}', [MomentController::class, 'update']);
        Route::delete('/moments/{slug}', [MomentController::class, 'destroy']);

        Route::post('/photos', [PhotoController::class, 'store']);
        Route::patch('/photos/{id}/pin', [PhotoController::class, 'togglePin']);
        Route::patch('/photos/{id}/cover', [PhotoController::class, 'setCover']);
        Route::delete('/photos/{id}', [PhotoController::class, 'destroy']);

        Route::get('/bucket', [BucketController::class, 'index']);
        Route::post('/bucket/categories', [BucketController::class, 'storeCategory']);
        Route::delete('/bucket/categories/{slug}', [BucketController::class, 'destroyCategory']);
        Route::post('/bucket/{categorySlug}/items', [BucketController::class, 'storeItem']);
        Route::patch('/bucket/items/{id}/toggle', [BucketController::class, 'toggleItem']);
        Route::delete('/bucket/items/{id}', [BucketController::class, 'destroyItem']);

        Route::get('/countries', [CountryController::class, 'index']);
        Route::post('/countries', [CountryController::class, 'store']);
        Route::delete('/countries/{id}', [CountryController::class, 'destroy']);
        Route::post('/countries/{id}/cities', [CountryController::class, 'storeCity']);
        Route::delete('/countries/{id}/cities', [CountryController::class, 'destroyCity']);

        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store']);
        Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']);

        Route::get('/events', [EventController::class, 'index']);
        Route::post('/events', [EventController::class, 'store']);
        Route::delete('/events/{id}', [EventController::class, 'destroy']);

        Route::get('/capsules', [CapsuleController::class, 'index']);
        Route::post('/capsules', [CapsuleController::class, 'store']);
        Route::get('/capsules/{slug}', [CapsuleController::class, 'show']);
        Route::delete('/capsules/{slug}', [CapsuleController::class, 'destroy']);

        Route::get('/wrapped', [WrappedController::class, 'index']);
        Route::get('/wrapped/{wrappedId}', [WrappedController::class, 'show']);
    });
});
