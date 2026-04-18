<?php

namespace App\Http\Controllers;

use App\Services\GoogleOAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class GoogleOAuthController extends Controller
{
    public function __construct(private GoogleOAuthService $googleOAuthService) {}

    /**
     * Redirect the user to Google's OAuth authorization page.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the callback from Google OAuth.
     */
    public function callback(): RedirectResponse|Response
    {
        try {
            $result = $this->googleOAuthService->handleCallback();

            // If existing user (new or linked), log them in
            if (!$result['isNewUser']) {
                Auth::login($result['user'], remember: true);
                return redirect('/dashboard')->with('status', 'Successfully logged in with Google!');
            }

            // New user — store OAuth data in session and show role selection
            session([
                'oauth_pending' => [
                    'google_id' => $result['googleData']['google_id'],
                    'name' => $result['googleData']['name'],
                    'email' => $result['googleData']['email'],
                    'avatar' => $result['googleData']['avatar'],
                ],
            ]);

            return Inertia::render('auth/oauth-select-role', [
                'oauthUser' => [
                    'name' => $result['googleData']['name'],
                    'email' => $result['googleData']['email'],
                    'avatar' => $result['googleData']['avatar'],
                ],
                'completeSignupUrl' => route('google.complete-signup'),
            ]);
        } catch (\Exception $e) {
            Log::error('Google OAuth callback failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect('/login')->with('error', 'Failed to authenticate with Google. Please try again.');
        }
    }

    /**
     * Handle JWT credential from Google Sign-In Button.
     * This endpoint receives the JWT token directly from the frontend GoogleLogin component.
     */
    public function handleAuthCode(Request $request): RedirectResponse
    {
        try {
            // Validate and get the JWT credential from the request
            $validated = $request->validate(['credential' => 'required|string']);
            $credential = $validated['credential'];

            // Decode and verify the JWT credential
            $result = $this->googleOAuthService->handleGoogleJWT($credential);

            // If existing user, log them in directly
            if (!$result['isNewUser']) {
                Auth::login($result['user'], remember: true);
                return redirect('/dashboard')->with('status', 'Successfully logged in with Google!');
            }

            // New user — store OAuth data in session and show role selection
            session([
                'oauth_pending' => [
                    'google_id' => $result['googleData']['google_id'],
                    'name' => $result['googleData']['name'],
                    'email' => $result['googleData']['email'],
                    'avatar' => $result['googleData']['avatar'],
                ],
            ]);

            // Redirect to role selection
            return redirect(route('google.role-selection'))->with('oauth_user', [
                'name' => $result['googleData']['name'],
                'email' => $result['googleData']['email'],
                'avatar' => $result['googleData']['avatar'],
            ]);
        } catch (\Exception $e) {
            Log::error('Google JWT authentication failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect('/login')->with('error', 'Failed to authenticate with Google. Please try again.');
        }
    }

    /**
     * Show role selection page.
     */
    public function showRoleSelection(): Response|RedirectResponse
    {
        $oauthPending = session('oauth_pending');
        if (!$oauthPending) {
            return redirect('/login');
        }

        return Inertia::render('auth/oauth-select-role', [
            'oauthUser' => [
                'name' => $oauthPending['name'],
                'email' => $oauthPending['email'],
                'avatar' => $oauthPending['avatar'],
            ],
            'completeSignupUrl' => route('google.complete-signup'),
        ]);
    }

    /**
     * Complete OAuth signup with role selection.
     */
    public function completeSignup(Request $request): RedirectResponse
    {
        // Validate role selection
        $validated = $request->validate([
            'role' => ['required', 'in:engineer,teacher'],
        ]);

        $oauthData = session('oauth_pending');
        if (!$oauthData) {
            return redirect('/login')->with('error', 'OAuth session expired. Please try again.');
        }

        try {
            // Complete the signup with selected role
            $user = $this->googleOAuthService->completeSignup($oauthData, $validated['role']);

            // Clear session
            session()->forget('oauth_pending');

            // Log in the user
            Auth::login($user, remember: true);

            return redirect('/dashboard')->with('status', 'Account created successfully! Welcome to IoT-REAP.');
        } catch (\Exception $e) {
            Log::error('OAuth signup completion failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect('/login')->with('error', 'Failed to complete signup. Please try again.');
        }
    }
}
