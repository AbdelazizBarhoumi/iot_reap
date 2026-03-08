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
        Schema::table('cameras', function (Blueprint $table) {
            // Stream resolution (default 640x480 for USB/IP bandwidth)
            $table->unsignedSmallInteger('stream_width')->default(640)->after('source_url');
            $table->unsignedSmallInteger('stream_height')->default(480)->after('stream_width');
            $table->unsignedTinyInteger('stream_framerate')->default(15)->after('stream_height');
            // Input format: mjpeg is better for USB/IP (less bandwidth)
            $table->string('stream_input_format', 20)->default('mjpeg')->after('stream_framerate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cameras', function (Blueprint $table) {
            $table->dropColumn(['stream_width', 'stream_height', 'stream_framerate', 'stream_input_format']);
        });
    }
};
