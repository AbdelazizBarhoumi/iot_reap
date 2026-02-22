<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds a protocol_override field to allow sessions to use a different
     * protocol than the template default (e.g., use RDP for a VNC template).
     */
    public function up(): void
    {
        Schema::table('vm_sessions', function (Blueprint $table) {
            $table->enum('protocol_override', ['rdp', 'vnc', 'ssh'])->nullable()->after('session_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vm_sessions', function (Blueprint $table) {
            $table->dropColumn('protocol_override');
        });
    }
};
