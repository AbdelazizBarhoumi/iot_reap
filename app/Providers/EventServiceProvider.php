<?php

namespace App\Providers;

use App\Events\VMSessionActivated;
use App\Listeners\CreateGuacamoleConnectionListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

/**
 * Event service provider.
 * Maps events to their listeners.
 */
class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        VMSessionActivated::class => [
            CreateGuacamoleConnectionListener::class,
        ],
    ];
}
