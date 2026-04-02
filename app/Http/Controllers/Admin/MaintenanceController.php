<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Camera;
use App\Models\UsbDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    /**
     * Get all resources with their maintenance status.
     */
    public function index(Request $request): JsonResponse|Response
    {
        Gate::authorize('admin-only');

        $usbDevices = UsbDevice::with('gatewayNode')
            ->orderBy('name')
            ->get()
            ->map(fn ($d) => [
                'type' => 'usb_device',
                'id' => $d->id,
                'name' => $d->name,
                'description' => $d->admin_description,
                'maintenance_mode' => $d->maintenance_mode,
                'maintenance_notes' => $d->maintenance_notes,
                'maintenance_until' => $d->maintenance_until?->toIso8601String(),
                'is_in_maintenance' => $d->isInMaintenance(),
                'gateway' => $d->gatewayNode?->name,
                'status' => $d->status->value,
            ]);

        $cameras = Camera::with(['robot', 'gatewayNode'])
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'type' => 'camera',
                'id' => $c->id,
                'name' => $c->name,
                'description' => $c->admin_description,
                'maintenance_mode' => $c->maintenance_mode,
                'maintenance_notes' => $c->maintenance_notes,
                'maintenance_until' => $c->maintenance_until?->toIso8601String(),
                'is_in_maintenance' => $c->isInMaintenance(),
                'source' => $c->robot?->name ?? $c->gatewayNode?->name,
                'status' => $c->status->value,
            ]);

        $resources = collect()
            ->merge($usbDevices)
            ->merge($cameras)
            ->sortBy('name')
            ->values();

        if ($request->wantsJson()) {
            return response()->json(['data' => $resources]);
        }

        return Inertia::render('admin/MaintenancePage', [
            'resources' => $resources,
        ]);
    }

    /**
     * Set maintenance mode on a USB device.
     */
    public function setUsbDeviceMaintenance(Request $request, UsbDevice $device): JsonResponse
    {
        Gate::authorize('admin-only');

        $request->validate([
            'notes' => ['required', 'string', 'max:2000'],
            'until' => ['nullable', 'date', 'after:now'],
        ]);

        $until = $request->input('until') ? new \DateTime($request->input('until')) : null;
        $device->setMaintenance($request->input('notes'), $until);

        return response()->json([
            'message' => 'USB device maintenance mode enabled.',
            'data' => [
                'id' => $device->id,
                'maintenance_mode' => true,
                'maintenance_notes' => $device->maintenance_notes,
                'maintenance_until' => $device->maintenance_until?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Clear maintenance mode on a USB device.
     */
    public function clearUsbDeviceMaintenance(UsbDevice $device): JsonResponse
    {
        Gate::authorize('admin-only');

        $device->clearMaintenance();

        return response()->json([
            'message' => 'USB device maintenance mode cleared.',
            'data' => ['id' => $device->id, 'maintenance_mode' => false],
        ]);
    }

    /**
     * Set maintenance mode on a camera.
     */
    public function setCameraMaintenance(Request $request, Camera $camera): JsonResponse
    {
        Gate::authorize('admin-only');

        $request->validate([
            'notes' => ['required', 'string', 'max:2000'],
            'until' => ['nullable', 'date', 'after:now'],
        ]);

        $until = $request->input('until') ? new \DateTime($request->input('until')) : null;
        $camera->setMaintenance($request->input('notes'), $until);

        return response()->json([
            'message' => 'Camera maintenance mode enabled.',
            'data' => [
                'id' => $camera->id,
                'maintenance_mode' => true,
                'maintenance_notes' => $camera->maintenance_notes,
                'maintenance_until' => $camera->maintenance_until?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Clear maintenance mode on a camera.
     */
    public function clearCameraMaintenance(Camera $camera): JsonResponse
    {
        Gate::authorize('admin-only');

        $camera->clearMaintenance();

        return response()->json([
            'message' => 'Camera maintenance mode cleared.',
            'data' => ['id' => $camera->id, 'maintenance_mode' => false],
        ]);
    }

    /**
     * Update admin description for any resource.
     */
    public function updateDescription(Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $request->validate([
            'type' => ['required', 'in:usb_device,camera'],
            'id' => ['required', 'integer'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        $model = match ($request->input('type')) {
            'usb_device' => UsbDevice::findOrFail($request->input('id')),
            'camera' => Camera::findOrFail($request->input('id')),
        };

        $model->update(['admin_description' => $request->input('description')]);

        return response()->json([
            'message' => 'Description updated successfully.',
            'data' => [
                'type' => $request->input('type'),
                'id' => $model->id,
                'admin_description' => $model->admin_description,
            ],
        ]);
    }

    /**
     * Get resources currently in maintenance.
     */
    public function inMaintenance(Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $usbDevices = UsbDevice::inMaintenance()->get()->map(fn ($d) => [
            'type' => 'usb_device',
            'id' => $d->id,
            'name' => $d->name,
            'maintenance_notes' => $d->maintenance_notes,
            'maintenance_until' => $d->maintenance_until?->toIso8601String(),
        ]);

        $cameras = Camera::inMaintenance()->get()->map(fn ($c) => [
            'type' => 'camera',
            'id' => $c->id,
            'name' => $c->name,
            'maintenance_notes' => $c->maintenance_notes,
            'maintenance_until' => $c->maintenance_until?->toIso8601String(),
        ]);

        return response()->json([
            'data' => collect()->merge($usbDevices)->merge($cameras)->values(),
        ]);
    }
}
