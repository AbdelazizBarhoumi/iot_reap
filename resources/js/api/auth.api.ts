import client from './client';

export const authApi = {
    /**
     * Get the redirect URL for Google OAuth
     */
    async getGoogleRedirectUrl(): Promise<string> {
        const response = await client.get<{ url: string }>('/auth/oauth/google/redirect');
        return response.data.url;
    },

    /**
     * Redirect to Google OAuth login
     */
    redirectToGoogle(): void {
        window.location.href = '/auth/oauth/google/redirect';
    },
};
