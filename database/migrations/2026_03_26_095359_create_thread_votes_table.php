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
        Schema::create('thread_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('votable_type', ['thread', 'reply']);
            $table->unsignedBigInteger('votable_id');
            $table->tinyInteger('value')->default(1);
            $table->timestamps();

            $table->unique(['user_id', 'votable_type', 'votable_id']);
            $table->index(['votable_type', 'votable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thread_votes');
    }
};
