<?php

use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\ProviderController as AdminProviderController;
use App\Http\Controllers\Api\Admin\ServiceCategoryController as AdminServiceCategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Provider\CategoryController as ProviderCategoryController;
use App\Http\Controllers\Api\Provider\DashboardController as ProviderDashboardController;
use App\Http\Controllers\Api\Provider\ProfileController as ProviderProfileController;
use App\Http\Controllers\Api\Provider\ServiceController as ProviderServiceController;
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
        Route::get('/dashboard', AdminDashboardController::class);

        Route::get('/categories', [AdminServiceCategoryController::class, 'index']);
        Route::post('/categories', [AdminServiceCategoryController::class, 'store']);
        Route::get('/categories/{category}', [AdminServiceCategoryController::class, 'show']);
        Route::put('/categories/{category}', [AdminServiceCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminServiceCategoryController::class, 'destroy']);

        Route::get('/customers', [AdminCustomerController::class, 'index']);
        Route::get('/customers/{customer}', [AdminCustomerController::class, 'show']);

        Route::get('/providers', [AdminProviderController::class, 'index']);
        Route::get('/providers/{provider}', [AdminProviderController::class, 'show']);
        Route::put('/providers/{provider}/approve', [AdminProviderController::class, 'approve']);
        Route::put('/providers/{provider}/reject', [AdminProviderController::class, 'reject']);
        Route::put('/providers/{provider}/suspend', [AdminProviderController::class, 'suspend']);
    });

Route::middleware(['auth:sanctum', 'role:provider'])
    ->prefix('provider')
    ->group(function () {
        Route::get('/dashboard', ProviderDashboardController::class);
        Route::get('/profile', [ProviderProfileController::class, 'show']);
        Route::put('/profile', [ProviderProfileController::class, 'update']);
        Route::get('/categories', [ProviderCategoryController::class, 'index']);

        Route::get('/services', [ProviderServiceController::class, 'index']);
        Route::post('/services', [ProviderServiceController::class, 'store'])->middleware('provider.approved');
        Route::get('/services/{service}', [ProviderServiceController::class, 'show']);
        Route::put('/services/{service}', [ProviderServiceController::class, 'update']);
        Route::delete('/services/{service}', [ProviderServiceController::class, 'destroy']);
    });
