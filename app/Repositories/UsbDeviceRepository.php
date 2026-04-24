<?php

namespace App\Repositories;

use App\Enums\UsbDeviceStatus;
use App\Models\GatewayNode;
use App\Models\UsbDevice;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for USB device database access.
 */
class UsbDeviceRepository
{
    /**
     * Get all USB devices with their gateway nodes.
     */
    public function all(): Collection
    {
        return UsbDevice::with('gatewayNode')->get();
    }

    /**
     * Find a USB device by ID.
     */
    public function findById(int $id): ?UsbDevice
    {
        return UsbDevice::find($id);
    }

    /**
     * Find a USB device by ID with gateway node.
     */
    public function findByIdWithNode(int $id): ?UsbDevice
    {
        return UsbDevice::with('gatewayNode')->find($id);
    }

    /**
     * Find a USB device by gateway node and bus ID.
     */
    public function findByNodeAndBusId(GatewayNode $node, string $busid): ?UsbDevice
    {
        return UsbDevice::where('gateway_node_id', $node->id)
            ->where('busid', $busid)
            ->first();
    }

    /**
     * Get all devices for a specific gateway node.
     */
    public function findByNode(GatewayNode $node): Collection
    {
        return UsbDevice::where('gateway_node_id', $node->id)
            ->orderBy('name')
            ->get();
    }

    /**
     * Get all available devices.
     */
    public function findAvailable(): Collection
    {
        return UsbDevice::available()
            ->with('gatewayNode')
            ->get();
    }

    /**
     * Get all bound devices (ready for attachment).
     */
    public function findBound(): Collection
    {
        return UsbDevice::bound()
            ->with('gatewayNode')
            ->get();
    }

    /**
     * Get all attached devices.
     */
    public function findAttached(): Collection
    {
        return UsbDevice::attached()
            ->with('gatewayNode')
            ->get();
    }

    /**
     * Create a new USB device.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): UsbDevice
    {
        return UsbDevice::create($data);
    }

    /**
     * Update or create a USB device (for discovery).
     *
     * @param  array<string, mixed>  $attributes
     * @param  array<string, mixed>  $values
     */
    public function updateOrCreate(array $attributes, array $values): UsbDevice
    {
        return UsbDevice::updateOrCreate($attributes, $values);
    }

    /**
     * Update a USB device.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(UsbDevice $device, array $data): bool
    {
        return $device->update($data);
    }

    /**
     * Mark device as bound.
     */
    public function markBound(UsbDevice $device): bool
    {
        return $device->update(['status' => UsbDeviceStatus::BOUND]);
    }

    /**
     * Mark device as available (unbind).
     */
    public function markAvailable(UsbDevice $device): bool
    {
        return $device->update([
            'status' => UsbDeviceStatus::AVAILABLE,
            'attached_to' => null,
            'attached_session_id' => null,
            'attached_vm_ip' => null,
            'usbip_port' => null,
        ]);
    }

    /**
     * Mark device as attached to a VM.
     */
    public function markAttached(UsbDevice $device, string $vmName, ?string $sessionId = null, ?string $vmIp = null, ?string $port = null): bool
    {
        return $device->update([
            'status' => UsbDeviceStatus::ATTACHED,
            'attached_to' => $vmName,
            'attached_session_id' => $sessionId,
            'attached_vm_ip' => $vmIp,
            'usbip_port' => $port,
        ]);
    }

    /**
     * Detach device (back to bound state).
     */
    public function markDetached(UsbDevice $device): bool
    {
        return $device->update([
            'status' => UsbDeviceStatus::BOUND,
            'attached_to' => null,
            'attached_session_id' => null,
            'attached_vm_ip' => null,
            'usbip_port' => null,
        ]);
    }

    /**
     * Delete a USB device.
     */
    public function delete(UsbDevice $device): bool
    {
        return $device->delete();
    }

    /**
     * Delete all devices for a gateway node (for cleanup).
     */
    public function deleteByNode(GatewayNode $node): int
    {
        return UsbDevice::where('gateway_node_id', $node->id)->delete();
    }

    /**
     * Remove devices that are no longer present on a node.
     *
     * If a device is currently attached but physically disconnected,
     * mark it as DISCONNECTED instead of deleting (for audit trail).
     * Dedicated devices are never deleted - they are marked DISCONNECTED
     * so they can be reattached when they reappear.
     * Only deletes devices that are available or bound and not dedicated.
     *
     * @param  array<string>  $currentBusIds
     * @return int Number of devices affected (deleted or marked disconnected)
     */
    public function removeStaleDevices(GatewayNode $node, array $currentBusIds): int
    {
        /** @var Collection<int, UsbDevice> $staleDevices */
        $staleDevices = UsbDevice::where('gateway_node_id', $node->id)
            ->whereNotIn('busid', $currentBusIds)
            ->get();

        $affectedCount = 0;

        foreach ($staleDevices as $device) {
            if ($device->isAttached() || $device->isDedicated()) {
                // Device was physically unplugged while attached or has dedicated assignment
                // Mark as disconnected instead of deleting (keeps audit trail and dedicated config)
                $device->update([
                    'status' => UsbDeviceStatus::DISCONNECTED,
                    'is_camera' => false,
                ]);
                $affectedCount++;
            } else {
                // Device is available or bound with no special config - safe to delete
                $device->delete();
                $affectedCount++;
            }
        }

        return $affectedCount;
    }

    /**
     * Mark device as pending attachment to a VM that is not currently running.
     * When the VM starts, the device will be automatically attached.
     */
    public function markPendingAttach(
        UsbDevice $device,
        int $vmid,
        string $nodeName,
        int $serverId,
        ?string $vmIp = null,
        ?string $vmName = null
    ): bool {
        return $device->update([
            'status' => UsbDeviceStatus::PENDING_ATTACH,
            'pending_vmid' => $vmid,
            'pending_node' => $nodeName,
            'pending_server_id' => $serverId,
            'pending_vm_ip' => $vmIp,
            'pending_vm_name' => $vmName,
            'pending_since' => now(),
        ]);
    }

    /**
     * Clear pending attachment data and restore to bound state.
     */
    public function clearPendingAttach(UsbDevice $device): bool
    {
        return $device->update([
            'status' => UsbDeviceStatus::BOUND,
            'pending_vmid' => null,
            'pending_node' => null,
            'pending_server_id' => null,
            'pending_vm_ip' => null,
            'pending_vm_name' => null,
            'pending_since' => null,
        ]);
    }

    /**
     * Get all devices with pending attachments.
     */
    public function findPendingAttach(): Collection
    {
        return UsbDevice::pendingAttach()
            ->with(['gatewayNode', 'pendingServer'])
            ->get();
    }

    /**
     * Get devices with pending attachment for a specific VM.
     */
    public function findPendingForVm(int $vmid, int $serverId): Collection
    {
        return UsbDevice::pendingAttach()
            ->where('pending_vmid', $vmid)
            ->where('pending_server_id', $serverId)
            ->with('gatewayNode')
            ->get();
    }

    /**
     * Set dedicated VM assignment for a device.
     *
     * When the VM starts, this device will be automatically attached.
     * Unlike pending attachment, dedicated assignment persists permanently
     * and survives reboots.
     */
    public function setDedicatedVm(
        UsbDevice $device,
        int $vmid,
        string $nodeName,
        int $serverId
    ): bool {
        return $device->update([
            'dedicated_vmid' => $vmid,
            'dedicated_node' => $nodeName,
            'dedicated_server_id' => $serverId,
        ]);
    }

    /**
     * Clear dedicated VM assignment.
     */
    public function clearDedicatedVm(UsbDevice $device): bool
    {
        return $device->update([
            'dedicated_vmid' => null,
            'dedicated_node' => null,
            'dedicated_server_id' => null,
        ]);
    }

    /**
     * Get all devices dedicated to a specific VM.
     */
    public function findDedicatedForVm(int $vmid, int $serverId): Collection
    {
        return UsbDevice::dedicatedTo($vmid, $serverId)
            ->with('gatewayNode')
            ->get();
    }

    /**
     * Get all dedicated devices (for admin dashboard).
     */
    public function findAllDedicated(): Collection
    {
        return UsbDevice::whereNotNull('dedicated_vmid')
            ->with(['gatewayNode', 'dedicatedServer'])
            ->get();
    }

    /**
     * Find device by VID:PID (more reliable than busid which changes with port).
     */
    public function findByVidPid(string $vendorId, string $productId, ?int $gatewayNodeId = null): ?UsbDevice
    {
        $query = UsbDevice::where('vendor_id', strtolower($vendorId))
            ->where('product_id', strtolower($productId));

        if ($gatewayNodeId !== null) {
            $query->where('gateway_node_id', $gatewayNodeId);
        }

        return $query->first();
    }

    /**
     * Find a USB device by serial number.
     */
    public function findBySerial(string $serial, ?int $gatewayNodeId = null): ?UsbDevice
    {
        $query = UsbDevice::where('serial', strtolower($serial));

        if ($gatewayNodeId !== null) {
            $query->where('gateway_node_id', $gatewayNodeId);
        }

        return $query->first();
    }
}
