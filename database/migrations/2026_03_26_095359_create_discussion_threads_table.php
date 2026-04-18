<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('discussion_threads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_unit_id')->nullable()->constrained('training_units')->cascadeOnDelete();
            $table->foreignId('training_path_id')->constrained('training_paths')->cascadeOnDelete();
            $table->foreignUlid('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->enum('status', ['open', 'resolved', 'pinned', 'locked'])->default('open');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->boolean('is_flagged')->default(false);
            $table->unsignedInteger('view_count')->default(0);
            $table->unsignedInteger('reply_count')->default(0);
            $table->unsignedInteger('upvote_count')->default(0);
            $table->timestamp('last_reply_at')->nullable();
            $table->foreignUlid('last_reply_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['training_path_id', 'created_at']);
            $table->index(['training_unit_id', 'created_at']);
            $table->index(['author_id', 'created_at']);
            $table->index('is_flagged');
        });

        // FULLTEXT indexes are only supported on MySQL/MariaDB
        if (DB::getDriverName() === 'mysql') {
            Schema::table('discussion_threads', function (Blueprint $table) {
                $table->fullText(['title', 'content'], 'threads_fulltext');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discussion_threads');
    }
};
