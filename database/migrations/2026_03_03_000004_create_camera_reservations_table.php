<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('camera_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('camera_id')->constrained('cameras')->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('approved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('status')->default('pending');

            $table->dateTime('requested_start_at');
            $table->dateTime('requested_end_at');

            $table->dateTime('approved_start_at')->nullable();
            $table->dateTime('approved_end_at')->nullable();

            $table->dateTime('actual_start_at')->nullable();
            $table->dateTime('actual_end_at')->nullable();

            $table->text('purpose')->nullable();
            $table->text('admin_notes')->nullable();

            $table->integer('priority')->default(0);

            $table->timestamps();

            $table->index(
                ['camera_id', 'status', 'approved_start_at', 'approved_end_at'],
                'idx_camera_reservations_schedule'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('camera_reservations');
    }
};
