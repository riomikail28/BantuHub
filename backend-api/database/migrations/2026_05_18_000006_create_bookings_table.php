<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code')->unique();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->restrictOnDelete();
            $table->date('booking_date');
            $table->time('booking_time');
            $table->enum('service_method', ['home_service', 'visit_store', 'online_service']);
            $table->text('address')->nullable();
            $table->text('customer_note')->nullable();
            $table->enum('status', [
                'pending',
                'accepted',
                'rejected',
                'on_the_way',
                'arrived_at_location',
                'in_progress',
                'waiting_payment',
                'paid',
                'completed',
                'cancelled',
                'complaint',
            ])->default('pending')->index();
            $table->decimal('total_price', 12, 2);
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index(['service_id', 'booking_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
