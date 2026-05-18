<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\CustomerController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ProviderController;
use App\Http\Controllers\Api\Admin\ServiceCategoryController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'bantuhub-backend-api',
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register/customer', [AuthController::class, 'registerCustomer']);
    Route::post('/register/provider', [AuthController::class, 'registerProvider']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', DashboardController::class);

        Route::get('/categories', [ServiceCategoryController::class, 'index']);
        Route::post('/categories', [ServiceCategoryController::class, 'store']);
        Route::get('/categories/{category}', [ServiceCategoryController::class, 'show']);
        Route::put('/categories/{category}', [ServiceCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [ServiceCategoryController::class, 'destroy']);

        Route::get('/customers', [CustomerController::class, 'index']);
        Route::get('/customers/{customer}', [CustomerController::class, 'show']);

        Route::get('/providers', [ProviderController::class, 'index']);
        Route::get('/providers/{provider}', [ProviderController::class, 'show']);
        Route::put('/providers/{provider}/approve', [ProviderController::class, 'approve']);
        Route::put('/providers/{provider}/reject', [ProviderController::class, 'reject']);
        Route::put('/providers/{provider}/suspend', [ProviderController::class, 'suspend']);
    });
