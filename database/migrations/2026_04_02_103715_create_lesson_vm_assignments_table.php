<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trainingUnit_vm_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainingUnit_id')->constrained('training_units')->cascadeOnDelete();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedBigInteger('template_id')->nullable();
            $table->boolean('is_direct_vm')->default(false);
            $table->text('teacher_notes')->nullable();
            $table->text('admin_feedback')->nullable();
            $table->timestamps();

            $table->index(['trainingUnit_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainingUnit_vm_assignments');
    }
};
