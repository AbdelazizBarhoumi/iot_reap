<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds support for multiple named connection profiles per protocol.
     * Users can now save multiple RDP/VNC/SSH configurations and select which to use.
     */
    public function up(): void
    {
        Schema::table('guacamole_connection_preferences', function (Blueprint $table) {
            // Must drop foreign key first since MySQL uses the unique index for it
            $table->dropForeign(['user_id']);
        });

        Schema::table('guacamole_connection_preferences', function (Blueprint $table) {
            // Drop the old unique constraint
            $table->dropUnique(['user_id', 'vm_session_type']);

            // Add profile name and default flag
            $table->string('profile_name', 100)->default('Default')->after('vm_session_type');
            $table->boolean('is_default')->default(true)->after('profile_name');

            // New unique constraint with short name (max 64 chars)
            $table->unique(['user_id', 'vm_session_type', 'profile_name'], 'gcp_user_protocol_profile_idx');

            // Re-add the foreign key with short name
            $table->foreign('user_id', 'gcp_user_id_foreign')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guacamole_connection_preferences', function (Blueprint $table) {
            $table->dropForeign('gcp_user_id_foreign');
        });

        Schema::table('guacamole_connection_preferences', function (Blueprint $table) {
            $table->dropUnique('gcp_user_protocol_profile_idx');
            $table->dropColumn(['profile_name', 'is_default']);
            $table->unique(['user_id', 'vm_session_type']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
