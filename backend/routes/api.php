<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Admin\RegionController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\UserController;

// =========================================================================
// ✅ BUNGKUS SEMUA ROUTE DI DALAM PREFIX v1 AGAR SINKRON DENGAN VERCEL & VPS
// =========================================================================
Route::prefix('v1')->group(function () {

    // ============================================================
    // PUBLIC — Tidak butuh token
    // ============================================================
    Route::get('/public/categories', [PublicController::class, 'categories']);

    // ============================================================
    // AUTH — Customer
    // ============================================================
    Route::prefix('auth')->group(function () {
        Route::post('/register',    [AuthController::class, 'register']);
        Route::post('/login',       [AuthController::class, 'login']);
        Route::post('/verify-otp',  [AuthController::class, 'verifyOtp']);
    });

    // ============================================================
    // AUTH — Admin (endpoint terpisah, cek role admin di controller)
    // ============================================================
    Route::prefix('auth/admin')->group(function () {
        Route::post('/request-otp', [AuthController::class, 'adminRequestOtp']);
        Route::post('/verify-otp',  [AuthController::class, 'adminVerifyOtp']);
    });

    // ============================================================
    // CUSTOMER — Butuh token + role customer
    // ============================================================
    Route::middleware(['auth:sanctum', 'role:customer'])->prefix('customer')->group(function () {
        Route::put('/profile', [ProfileController::class, 'update']);

        Route::apiResource('addresses', AddressController::class)->except(['show']);
        Route::put('/addresses/{address}/primary', [AddressController::class, 'setPrimary']);

        Route::get('/regions', [PublicController::class, 'regions']);

        Route::get('/orders/history', [CustomerOrderController::class, 'history']);
        Route::get('/orders/active',  [CustomerOrderController::class, 'active']);
        Route::get('/orders/{code}',  [CustomerOrderController::class, 'show']);
        Route::post('/orders',         [CustomerOrderController::class, 'store']);
        Route::post('/orders/{code}/cancel', [CustomerOrderController::class, 'cancel']);
    });

    // ============================================================
    // ADMIN — Butuh token + role admin
    // ============================================================
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {

        // Wilayah
        Route::get('/cities',                    [RegionController::class, 'getCities']);
        Route::post('/cities',                   [RegionController::class, 'storeCity']);
        Route::put('/cities/{city}',             [RegionController::class, 'updateCity']);
        Route::delete('/cities/{city}',          [RegionController::class, 'destroyCity']);
        Route::post('/districts',                [RegionController::class, 'storeDistrict']);
        Route::put('/districts/{district}',      [RegionController::class, 'updateDistrict']);
        Route::delete('/districts/{district}',   [RegionController::class, 'destroyDistrict']);
        Route::post('/villages',                 [RegionController::class, 'storeVillage']);
        Route::put('/villages/{village}',        [RegionController::class, 'updateVillage']);
        Route::delete('/villages/{village}',     [RegionController::class, 'destroyVillage']);

        // Kategori & Service
        Route::apiResource('categories', CategoryController::class);
        Route::put('/categories/{id}/restore', [CategoryController::class, 'restore']);
        Route::apiResource('services', ServiceController::class);
        Route::put('/services/{id}/restore',   [ServiceController::class, 'restore']);

        // Pesanan
        Route::get('/orders/badge-count',              [AdminOrderController::class, 'badgeCount']);
        Route::get('/orders',                          [AdminOrderController::class, 'index']);
        Route::get('/orders/{code}',                  [AdminOrderController::class, 'show']);
        Route::put('/orders/{order}/status',           [AdminOrderController::class, 'updateStatus']);
        Route::put('/orders/{order}/payment',          [AdminOrderController::class, 'updatePayment']);
        Route::get('/orders/{order}/invoice',          [AdminOrderController::class, 'invoice']);
        Route::post('/orders/{order}/items',           [AdminOrderController::class, 'addItem']);
        Route::put('/orders/{order}/items/{item}',     [AdminOrderController::class, 'updateItem']);
        Route::delete('/orders/{order}/items/{item}',  [AdminOrderController::class, 'deleteItem']);

        // User & Admin
        Route::get('/users',       [UserController::class, 'index']);
        Route::post('/admins',     [UserController::class, 'storeAdmin']);
    });

}); 