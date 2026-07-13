<?php

use Illuminate\Support\Facades\Route;

// SPA — všetky ne-API cesty obsluhuje React aplikácia.
Route::view('/{any?}', 'app')->where('any', '^(?!api|storage|sanctum).*$');
