<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Robot model.
 *
 * @property int $id
 * @property string $name
 * @property string $identifier
 * @property string|null $description
 * @property string $status
 * @property string|null $ip_address
 */
class Robot extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'identifier',
        'description',
        'status',
        'ip_address',
    ];

    /**
     * Get all cameras attached to this robot.
     */
    public function cameras(): HasMany
    {
        return $this->hasMany(Camera::class);
    }
}
