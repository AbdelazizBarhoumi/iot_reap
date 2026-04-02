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
        Schema::create('thread_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained('discussion_threads')->cascadeOnDelete();
            $table->foreignUlid('author_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('thread_replies')->cascadeOnDelete();
            $table->text('content');
            $table->boolean('is_answer')->default(false);
            $table->boolean('is_flagged')->default(false);
            $table->unsignedInteger('upvote_count')->default(0);
            $table->timestamps();

            $table->index(['thread_id', 'created_at']);
            $table->index(['author_id', 'created_at']);
            $table->index('parent_id');
            $table->index('is_flagged');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thread_replies');
    }
};
