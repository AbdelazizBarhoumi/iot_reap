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
        Schema::create('usb_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gateway_node_id')->constrained('gateway_nodes')->cascadeOnDelete();
            $table->string('busid');                       // "1-1.2"
            $table->string('vendor_id');                   // "04a9"
            $table->string('product_id');                  // "2228"
            $table->string('name');                        // "Canon Printer"
            $table->string('status')->default('available'); // available, bound, attached
            $table->string('attached_to')->nullable();     // VM name or session ID
            $table->string('attached_vm_ip')->nullable();  // VM IP for detach operations
            $table->string('usbip_port')->nullable();      // Port number when attached
            $table->timestamps();

            $table->unique(['gateway_node_id', 'busid']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usb_devices');
    }
};
