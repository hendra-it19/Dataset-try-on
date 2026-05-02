<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Video Routes
    Route::get('record-video/{type}', function ($type) {
        return Inertia::render('record-video', ['type' => $type]);
    })->name('record.video');

    Route::post('video/before', [VideoController::class, 'storeBefore'])->name('video.before.store');
    Route::post('video/after', [VideoController::class, 'storeAfter'])->name('video.after.store');
    Route::post('video/after/{video}', [VideoController::class, 'updateAfterLink'])->name('video.after.link');

    // Admin Routes
    Route::middleware('can:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [AdminController::class, 'index'])->name('dashboard');
        Route::get('export/excel', [AdminController::class, 'exportExcel'])->name('export.excel');
        Route::get('export/pdf', [AdminController::class, 'exportPdf'])->name('export.pdf');
        Route::get('download-batch', [AdminController::class, 'downloadBatch'])->name('download.batch');
    });
});

require __DIR__.'/settings.php';
