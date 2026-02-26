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
     * @param array<string, mixed> $data
     */
    public function create(array $data): UsbDevice
    {
        return UsbDevice::create($data);
    }

    /**
     * Update or create a USB device (for discovery).
     *
     * @param array<string, mixed> $attributes
     * @param array<string, mixed> $values
     */
    public function updateOrCreate(array $attributes, array $values): UsbDevice
    {
        return UsbDevice::updateOrCreate($attributes, $values);
    }

    /**
     * Update a USB device.
     *
     * @param array<string, mixed> $data
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
     * @param array<string> $currentBusIds
     */
    public function removeStaleDevices(GatewayNode $node, array $currentBusIds): int
    {
        return UsbDevice::where('gateway_node_id', $node->id)
            ->whereNotIn('busid', $currentBusIds)
            ->delete();
    }
}
