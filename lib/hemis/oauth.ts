// HEMIS OAuth Authentication
// Allows users to login with their HEMIS credentials

interface HemisAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    baseUrl: string;
}

interface HemisTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
}

interface HemisUserInfo {
    id: string;
    username: string;
    email: string;
    full_name: string;
    student_id?: string;
    type: 'student' | 'teacher' | 'employee';
}

export class HemisOAuth {
    private config: HemisAuthConfig;

    constructor(config: HemisAuthConfig) {
        this.config = config;
    }

    /**
     * Get authorization URL for HEMIS login
     */
    getAuthorizationUrl(state?: string): string {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: 'basic profile student',
            ...(state && { state }),
        });

        return `${this.config.baseUrl}/oauth/authorize?${params.toString()}`;
    }

    /**
     * Exchange authorization code for access token
     */
    async getAccessToken(code: string): Promise<HemisTokenResponse> {
        const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                redirect_uri: this.config.redirectUri,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to get access token from HEMIS');
        }

        return response.json();
    }

    /**
     * Get user information using access token
     */
    async getUserInfo(accessToken: string): Promise<HemisUserInfo> {
        const response = await fetch(`${this.config.baseUrl}/oauth/user`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get user info from HEMIS');
        }

        return response.json();
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<HemisTokenResponse> {
        const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        return response.json();
    }
}

// Export singleton instance
export const hemisOAuth = new HemisOAuth({
    clientId: process.env.HEMIS_CLIENT_ID || '',
    clientSecret: process.env.HEMIS_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/auth/hemis/callback' || '',
    baseUrl: process.env.NEXT_PUBLIC_HEMIS_API_URL || 'https://student.umft.uz/rest/v1',
});
