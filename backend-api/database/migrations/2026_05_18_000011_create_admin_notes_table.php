<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->cascadeOnDelete();
            $table->enum('note_type', [
                'customer_note',
                'provider_note',
                'booking_note',
                'complaint_note',
                'follow_up',
                'warning',
            ])->index();
            $table->text('note');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'note_type']);
            $table->index(['booking_id', 'note_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_notes');
    }
};
