<?php

namespace App\Services;

interface ProxmoxClientInterface
{
    public function getNodes(): array;

    public function getNodeStatus(string $node): array;

    public function cloneTemplate(int $templateVmid, string $node, string $newVmid, string $newName = null): int;

    public function startVM(string $node, int $vmid): void;

    public function stopVM(string $node, int $vmid): void;

    public function deleteVM(string $node, int $vmid): void;

    public function getVMStatus(string $node, int $vmid): array;

    public function getVMStats(string $node, int $vmid): array;
}
