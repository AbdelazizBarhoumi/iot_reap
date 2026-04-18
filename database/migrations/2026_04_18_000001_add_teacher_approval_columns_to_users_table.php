<?php

use App\Enums\UserRole;
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
        Schema::table('users', function (Blueprint $table): void {
            $table->timestamp('teacher_approved_at')->nullable()->useCurrent()->after('role');
            $table->foreignUlid('teacher_approved_by')->nullable()->after('teacher_approved_at')->constrained('users')->nullOnDelete();
        });

        // Keep existing teacher accounts working after rollout.
        DB::table('users')
            ->where('role', UserRole::TEACHER->value)
            ->whereNull('teacher_approved_at')
            ->update(['teacher_approved_at' => now()]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign(['teacher_approved_by']);
            $table->dropColumn(['teacher_approved_by', 'teacher_approved_at']);
        });
    }
};
