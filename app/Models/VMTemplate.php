<?php

namespace App\Models;

use App\Enums\VMTemplateOSType;
use App\Enums\VMTemplateProtocol;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * App VM template model.
 *
 * @property int $id
 * @property string $name
 * @property VMTemplateOSType $os_type
 * @property VMTemplateProtocol $protocol
 * @property int $template_vmid
 * @property int $cpu_cores
 * @property int $ram_mb
 * @property int $disk_gb
 * @property array $tags
 * @property bool $is_active
 */
class VMTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'os_type',
        'protocol',
        'template_vmid',
        'cpu_cores',
        'ram_mb',
        'disk_gb',
        'tags',
        'is_active',
    ];

    protected $casts = [
        'os_type' => VMTemplateOSType::class,
        'protocol' => VMTemplateProtocol::class,
        'tags' => 'array',
        'is_active' => 'boolean',
        'cpu_cores' => 'integer',
        'ram_mb' => 'integer',
        'disk_gb' => 'integer',
        'template_vmid' => 'integer',
    ];

    public function vmSessions(): HasMany
    {
        return $this->hasMany(VMSession::class, 'template_id');
    }
}
