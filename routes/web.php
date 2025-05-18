<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Approver\ApproverController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Requester\RequesterController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::redirect('/', 'dashboard');
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/view_users', [AdminController::class, 'view_users'])->name('admin.view_users');
});
Route::middleware(['auth', 'role:requester'])->prefix('requester')->group(function () {
    Route::get('/', [RequesterController::class, 'dashboard'])->name('requester.dashboard');
    Route::get('/create', [RequesterController::class, 'create'])->name('requester.create');
    Route::post('/store', [RequesterController::class, 'store'])->name('requester.store');
    Route::get('/manage_requests', [RequesterController::class, 'manage_requests'])->name('requester.manage_requests');
    Route::get('/add_details/{pr}', [RequesterController::class, 'add_details'])->name('requester.add_details');
    Route::post('/store_details/{pr}', [RequesterController::class, 'store_details'])->name('requester.store_details');
    Route::get('/requester/print/{id}', [RequesterController::class, 'print'])->name('requester.print');
    Route::post('/requests/{id}/send-for-approval', [RequesterController::class, 'sendForApproval'])->name('requester.pr.send_for_approval');

});
Route::middleware(['auth', 'role:bac_approver'])->prefix('bac_approver')->group(function () {
    Route::get('/', [ApproverController::class, 'dashboard'])->name('bac_approver.dashboard');
    Route::get('/purchase_requests', [ApproverController::class, 'purchase_requests'])->name('bac_approver.purchase_requests');
    Route::get('/for_review', [ApproverController::class, 'for_review'])->name('bac_approver.for_review');
    Route::get('/approve/{pr}', [ApproverController::class, 'approve'])->name('bac_approver.approve');
    Route::get('/show_details/{pr}', [ApproverController::class, 'show_details'])->name('bac_approver.show_details');

});
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
