<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('service_categories')->restrictOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->enum('service_method', ['home_service', 'visit_store', 'online_service']);
            $table->string('image')->nullable();
            $table->enum('status', ['active', 'inactive', 'pending_review'])->default('pending_review')->index();
            $table->timestamps();

            $table->unique(['provider_id', 'slug']);
            $table->index(['provider_id', 'status']);
            $table->index(['category_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
