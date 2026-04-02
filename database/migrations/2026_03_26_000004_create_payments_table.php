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
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('stripe_session_id')->unique();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('status')->default('pending');
            $table->unsignedInteger('amount_cents');
            $table->string('currency', 3)->default('USD');
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['course_id', 'status']);
            $table->index('stripe_session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
