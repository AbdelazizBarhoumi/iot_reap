<?php

namespace App\Services;

use App\Exceptions\ProxmoxApiException;

class ProxmoxClientFake implements ProxmoxClientInterface
{
    private array $responses = [];

    private bool $shouldFail = false;

    private string $failureMessage = 'Simulated Proxmox API failure';

    /**
     * Set up a fake response for a method.
     */
    public function stub(string $method, mixed $response): self
    {
        $this->responses[$method] = $response;

        return $this;
    }

    /**
     * Configure the fake to throw an exception.
     */
    public function fail(string $message = 'Simulated Proxmox API failure'): self
    {
        $this->shouldFail = true;
        $this->failureMessage = $message;

        return $this;
    }

    /**
     * Reset the fake to default state.
     */
    public function reset(): self
    {
        $this->responses = [];
        $this->shouldFail = false;
        $this->failureMessage = 'Simulated Proxmox API failure';

        return $this;
    }

    public function getNodes(): array
    {
        if ($this->shouldFail) {
            throw ProxmoxApiException::fromProxmoxError($this->failureMessage);
        }

        return $this->responses['getNodes'] ?? [
            [
                'node' => 'pve-node-1',
                'status' => 'online',
                'uptime' => 86400,
                'cpu' => 0.5,
                'maxcpu' => 16,
                'mem' => 32000000000,
                'maxmem' => 64000000000,
            ],
        ];
    }

    public function getNodeStatus(string $node): array
    {
        if ($this->shouldFail) {
            throw ProxmoxApiException::fromProxmoxError($this->failureMessage);
        }

        return $this->responses['getNodeStatus'] ?? [
            'node' => $node,
            'status' => 'online',
            'uptime' => 86400,
            'cpu' => 0.5,
            'maxcpu' => 16,
            'mem' => 32000000000,
            'maxmem' => 64000000000,
        ];
    }

    public function cloneTemplate(int $templateVmid, string $node, string $newVmid, string $newName = null): int
    {
        if ($this->shouldFail) {
            throw ProxmoxApiException::fromProxmoxError($this->failureMessage);
        }

        return $this->responses['cloneTemplate'] ?? (int) $newVmid;
    }

    public function startVM(string $node, int $vmid): void
    {
        if ($this->shouldFail) {
            throw ProxmoxApiException::fromProxmoxError($this->failureMessage);
        }
    }

    public function stopVM(string $node, int $vmid): void
    {
        if ($this->shouldFail) {
            throw ProxmoxApiException::fromProxmoxError($this->failureMessage);
        }
    }

    public function deleteVM(string $node, int $vmid): void
    {
        if ($this->shouldFail) {
            throw ProxmoxApiException::fromProxmoxError($this->failureMessage);
        }
    }

    public function getVMStatus(string $node, int $vmid): array
    {
        if ($this->shouldFail) {
            throw ProxmoxApiException::fromProxmoxError($this->failureMessage);
        }

        return $this->responses['getVMStatus'] ?? [
            'vmid' => $vmid,
            'node' => $node,
            'status' => 'running',
            'uptime' => 3600,
            'cpu' => 0.3,
            'maxcpu' => 4,
            'mem' => 2000000000,
            'maxmem' => 4000000000,
        ];
    }

    public function getVMStats(string $node, int $vmid): array
    {
        if ($this->shouldFail) {
            throw ProxmoxApiException::fromProxmoxError($this->failureMessage);
        }

        return $this->responses['getVMStats'] ?? [
            'vmid' => $vmid,
            'node' => $node,
            'status' => 'running',
            'uptime' => 3600,
            'cpu' => 0.3,
            'maxcpu' => 4,
            'mem' => 2000000000,
            'maxmem' => 4000000000,
        ];
    }
}
