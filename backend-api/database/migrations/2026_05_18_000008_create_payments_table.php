<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('service_price', 12, 2);
            $table->decimal('platform_fee_percent', 5, 2)->default(2.00);
            $table->decimal('platform_fee_amount', 12, 2);
            $table->decimal('provider_earning', 12, 2);
            $table->decimal('total_payment', 12, 2);
            $table->enum('payment_method', ['manual_transfer', 'cash']);
            $table->string('payment_proof')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'rejected', 'failed', 'refunded'])->default('pending')->index();
            $table->text('admin_note')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['payment_status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
