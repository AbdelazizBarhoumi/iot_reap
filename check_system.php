<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Gateway Nodes ===\n";
foreach (\App\Models\GatewayNode::all() as $node) {
    echo "ID: {$node->id}\n";
    echo "Name: {$node->name}\n";
    echo "API URL: {$node->api_url}\n";
    echo "Proxmox Node: {$node->proxmox_node}\n";
    echo "Proxmox VMID: {$node->proxmox_vmid}\n";
    echo "---\n";
}

echo "\n=== USB Devices ===\n";
foreach (\App\Models\UsbDevice::with(['gatewayNode', 'camera'])->get() as $device) {
    $hasCamera = $device->camera ? 'YES' : 'NO';
    echo "{$device->id} | {$device->name} | Gateway: {$device->gatewayNode->name} | Camera: {$hasCamera}\n";
    if ($device->camera) {
        echo "   Camera ID: {$device->camera->id} | Key: {$device->camera->stream_key}\n";
    }
}

echo "\n=== Cameras ===\n";
foreach (\App\Models\Camera::with(['gatewayNode', 'usbDevice'])->get() as $camera) {
    echo "ID: {$camera->id}\n";
    echo "Name: {$camera->name}\n";
    echo "Stream Key: {$camera->stream_key}\n";
    echo "Source URL: {$camera->source_url}\n";
    echo "Status: {$camera->status->value}\n";
    echo "Gateway: {$camera->gatewayNode?->name}\n";
    echo "USB Device ID: {$camera->usb_device_id}\n";
    echo "---\n";
}
