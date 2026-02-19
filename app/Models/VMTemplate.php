<?php

namespace App\Models;

use App\Enums\VMTemplateOSType;
use App\Enums\VMTemplateProtocol;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * VM template model.
 *
 * @property int $id
 * @property string $name
 * @property VMTemplateOSType $os_type
 * @property VMTemplateProtocol $protocol
 * @property int $template_vmid
 * @property int $cpu_cores
 * @property int $ram_mb
 * @property int $disk_gb
 * @property array|null $tags
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class VMTemplate extends Model
{
    /** @use HasFactory<\Database\Factories\VMTemplateFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'vm_templates';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
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

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'os_type' => VMTemplateOSType::class,
            'protocol' => VMTemplateProtocol::class,
            'tags' => 'json',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the VM sessions for this template.
     */
    public function vmSessions(): HasMany
    {
        return $this->hasMany(VMSession::class, 'template_id');
    }
}
