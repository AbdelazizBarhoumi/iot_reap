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
        Schema::table('vm_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('vm_sessions', 'credentials')) {
                $table->text('credentials')->nullable()->after('ip_address');
            }
            if (!Schema::hasColumn('vm_sessions', 'return_snapshot')) {
                $table->string('return_snapshot')->nullable()->after('credentials');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vm_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('vm_sessions', 'credentials')) {
                $table->dropColumn('credentials');
            }
            if (Schema::hasColumn('vm_sessions', 'return_snapshot')) {
                $table->dropColumn('return_snapshot');
            }
        });
    }
};
