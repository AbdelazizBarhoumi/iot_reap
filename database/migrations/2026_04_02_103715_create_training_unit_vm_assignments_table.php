<?php

use App\Enums\TrainingUnitVMAssignmentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * VM assignment for a trainingUnit (teacher → admin approval workflow).
     * Consolidated migration with all columns.
     */
    public function up(): void
    {
        Schema::create('training_unit_vm_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_unit_id')->constrained('training_units')->cascadeOnDelete();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedBigInteger('vm_id')->nullable();
            $table->unsignedBigInteger('node_id')->nullable();
            $table->string('vm_name')->nullable();
            $table->unsignedBigInteger('template_id')->nullable();
            $table->boolean('is_direct_vm')->default(false);
            $table->text('teacher_notes')->nullable();
            $table->text('admin_feedback')->nullable();
            $table->foreignUlid('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUlid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['training_unit_id', 'status']);
            $table->foreign('node_id')->references('id')->on('proxmox_nodes')->nullOnDelete();
            $table->index(['assigned_by', 'approved_by', 'node_id'], 'tuva_assigned_approved_node_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_unit_vm_assignments');
    }
};
