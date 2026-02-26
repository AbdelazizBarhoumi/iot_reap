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
        Schema::table('usb_devices', function (Blueprint $table) {
            // Link to the actual session when attached
            $table->foreignUlid('attached_session_id')
                ->nullable()
                ->after('attached_to')
                ->constrained('vm_sessions')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usb_devices', function (Blueprint $table) {
            $table->dropForeign(['attached_session_id']);
            $table->dropColumn('attached_session_id');
        });
    }
};
