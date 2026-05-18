<?php

use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\ProviderController as AdminProviderController;
use App\Http\Controllers\Api\Admin\ServiceCategoryController as AdminServiceCategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Customer\BookingController as CustomerBookingController;
use App\Http\Controllers\Api\Customer\CategoryController as CustomerCategoryController;
use App\Http\Controllers\Api\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Api\Customer\PaymentController as CustomerPaymentController;
use App\Http\Controllers\Api\Customer\ServiceController as CustomerServiceController;
use App\Http\Controllers\Api\Provider\BookingController as ProviderBookingController;
use App\Http\Controllers\Api\Provider\CategoryController as ProviderCategoryController;
use App\Http\Controllers\Api\Provider\DashboardController as ProviderDashboardController;
use App\Http\Controllers\Api\Provider\EarningController as ProviderEarningController;
use App\Http\Controllers\Api\Provider\ProfileController as ProviderProfileController;
use App\Http\Controllers\Api\Provider\ServiceController as ProviderServiceController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'bantuhub-backend-api',
    ]);
});

Route::get('/categories', [CustomerCategoryController::class, 'index']);
Route::get('/services', [CustomerServiceController::class, 'index']);
Route::get('/services/{service}', [CustomerServiceController::class, 'show']);

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

        Route::get('/payments', [AdminPaymentController::class, 'index']);
        Route::get('/payments/{payment}', [AdminPaymentController::class, 'show']);
        Route::put('/payments/{payment}/approve', [AdminPaymentController::class, 'approve']);
        Route::put('/payments/{payment}/reject', [AdminPaymentController::class, 'reject']);
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

        Route::get('/bookings', [ProviderBookingController::class, 'index']);
        Route::get('/bookings/{booking}', [ProviderBookingController::class, 'show']);
        Route::put('/bookings/{booking}/accept', [ProviderBookingController::class, 'accept']);
        Route::put('/bookings/{booking}/reject', [ProviderBookingController::class, 'reject']);
        Route::put('/bookings/{booking}/status', [ProviderBookingController::class, 'updateStatus']);

        Route::get('/earnings', ProviderEarningController::class);
    });

Route::middleware(['auth:sanctum', 'role:customer'])
    ->prefix('customer')
    ->group(function () {
        Route::get('/dashboard', CustomerDashboardController::class);
        Route::post('/bookings', [CustomerBookingController::class, 'store']);
        Route::get('/bookings', [CustomerBookingController::class, 'index']);
        Route::get('/bookings/{booking}', [CustomerBookingController::class, 'show']);
        Route::post('/bookings/{booking}/payment', [CustomerPaymentController::class, 'store']);
        Route::get('/bookings/{booking}/payment', [CustomerPaymentController::class, 'show']);
    });
