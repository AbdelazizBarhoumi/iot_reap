<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Register all of the broadcast channels that your application supports.
| Private channels require authorization via the callback functions below.
|
*/

// Private user notification channel
Broadcast::channel('App.Models.User.{id}', function (User $user, string $id): bool {
    return $user->id === $id;
});

// Private session channel (for USB attachment progress, VM status, etc.)
Broadcast::channel('session.{sessionId}', function (User $user, string $sessionId): bool {
    return $user->sessions()->where('id', $sessionId)->exists();
});
