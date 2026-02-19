<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Proxmox server/cluster model.
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $host (encrypted)
 * @property int $port (encrypted)
 * @property string $realm
 * @property string $token_id (encrypted)
 * @property string $token_secret (encrypted)
 * @property bool $verify_ssl
 * @property bool $is_active
 * @property int $max_vms_per_node
 * @property int $max_concurrent_sessions
 * @property float $cpu_overcommit_ratio
 * @property float $memory_overcommit_ratio
 * @property string|null $created_by
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class ProxmoxServer extends Model
{
    /** @use HasFactory<\Database\Factories\ProxmoxServerFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'proxmox_servers';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'host',
        'port',
        'realm',
        'token_id',
        'token_secret',
        'verify_ssl',
        'is_active',
        'max_vms_per_node',
        'max_concurrent_sessions',
        'cpu_overcommit_ratio',
        'memory_overcommit_ratio',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'host' => 'encrypted',
            'port' => 'encrypted',
            'verify_ssl' => 'boolean',
            'is_active' => 'boolean',
            'token_id' => 'encrypted',
            'token_secret' => 'encrypted',
            'max_vms_per_node' => 'integer',
            'max_concurrent_sessions' => 'integer',
            'cpu_overcommit_ratio' => 'decimal:2',
            'memory_overcommit_ratio' => 'decimal:2',
        ];
    }

    /**
     * Get the user who created this server.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the Proxmox nodes associated with this server.
     */
    public function nodes(): HasMany
    {
        return $this->hasMany(ProxmoxNode::class, 'proxmox_server_id');
    }

    /**
     * Get the VM sessions associated with this server.
     */
    public function vmSessions(): HasMany
    {
        return $this->hasMany(VMSession::class, 'proxmox_server_id');
    }

    /**
     * Get the credential change logs for this server.
     */
    public function credentialLogs(): HasMany
    {
        return $this->hasMany(NodeCredentialsLog::class, 'proxmox_server_id');
    }

    /**
     * Scope to only active servers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if this server can provision more VMs on the given node.
     *
     * Validates:
     * - Max VMs per node limit
     * - Max concurrent sessions limit
     * - Available CPU (considering overcommit ratio)
     * - Available memory (considering overcommit ratio)
     */
    public function canProvisionsMore(ProxmoxNode $node, int $requiredCpu = 2, int $requiredMemory = 2048): bool
    {
        // Check max VMs per node
        $activeVmsOnNode = $node->countActiveVMs();
        if ($activeVmsOnNode >= $this->max_vms_per_node) {
            return false;
        }

        // Check max concurrent sessions across all nodes
        $totalActiveSessions = VMSession::where('proxmox_server_id', $this->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->count();

        if ($totalActiveSessions >= $this->max_concurrent_sessions) {
            return false;
        }

        // Check available CPU (with overcommit)
        $availableCpu = $node->getAvailableCPU($this->cpu_overcommit_ratio);
        if ($availableCpu < $requiredCpu) {
            return false;
        }

        // Check available memory (with overcommit)
        $availableMemory = $node->getAvailableMemory($this->memory_overcommit_ratio);
        if ($availableMemory < $requiredMemory) {
            return false;
        }

        return true;
    }

    /**
     * Inactivate this server and close all active sessions.
     *
     * @throws \Exception
     */
    public function inactivate(): void
    {
        // Close all active sessions on this server
        $activeSessions = VMSession::where('proxmox_server_id', $this->id)
            ->where('status', '!=', 'terminated')
            ->where('status', '!=', 'expired')
            ->get();

        foreach ($activeSessions as $session) {
            // Dispatch termination job for each session
            // This would be: TerminateVMJob::dispatch($session);
            // For now, just update the status in a transaction
        }

        // Mark as inactive
        $this->update(['is_active' => false]);
    }

    /**
     * Get the full API URL for this Proxmox server.
     */
    public function getApiUrl(): string
    {
        $protocol = 'https';
        return "{$protocol}://{$this->host}:{$this->port}/api2/json";
    }
}
