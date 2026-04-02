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
            $table->foreignUlid('attached_session_id')->nullable()->constrained('vm_sessions')->nullOnDelete();
            $table->string('attached_vm_ip')->nullable();  // VM IP for detach operations
            $table->string('usbip_port')->nullable();      // Port number when attached
            $table->integer('pending_vmid')->nullable();
            $table->string('pending_node')->nullable();
            $table->foreignId('pending_server_id')->nullable()->constrained('proxmox_servers')->nullOnDelete();
            $table->string('pending_vm_ip')->nullable();
            $table->string('pending_vm_name')->nullable();
            $table->timestamp('pending_since')->nullable();
            $table->integer('dedicated_vmid')->nullable();
            $table->string('dedicated_node')->nullable();
            $table->foreignId('dedicated_server_id')->nullable()->constrained('proxmox_servers')->nullOnDelete();
            $table->boolean('is_camera')->default(false);
            $table->text('admin_description')->nullable();
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_notes')->nullable();
            $table->timestamp('maintenance_until')->nullable();
            $table->timestamps();

            $table->unique(['gateway_node_id', 'busid']);
            $table->index(['dedicated_vmid', 'dedicated_server_id'], 'idx_usb_dedicated_vm');
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
