/**
 * OAuth 2.0 Configuration
 * Centralizes all OAuth endpoints and default values
 */

const BASE_URL = import.meta.env.VITE_BASE_URL

export const OAUTH_CONFIG = {
    // Default values from environment variables
    DEFAULT_CLIENT_ID: import.meta.env.VITE_AUTH_CLIENT_ID,
    DEFAULT_SERVER: import.meta.env.VITE_AUTH_URL,
    DEFAULT_SCOPE: 'openid offline',

    // Base URL for this application
    BASE_URL,

    // OAuth endpoints (relative to server)
    ENDPOINTS: {
        AUTHORIZATION: '/oauth2/auth',
        TOKEN: '/oauth2/token',
        USERINFO: '/userinfo',
        LOGOUT: '/oauth2/sessions/logout',
    },

    // Callback URL for OAuth redirect
    CALLBACK_PATH: '/authz/callback',

    // PKCE configuration
    PKCE: {
        CHALLENGE_LENGTH: 43,
        CODE_CHALLENGE_METHOD: 'S256',
        STATE_LENGTH: 32,
    },
} as const

export const getCallbackUrl = () => BASE_URL + OAUTH_CONFIG.CALLBACK_PATH

export const getAuthUrl = (server: string) => server + OAUTH_CONFIG.ENDPOINTS.AUTHORIZATION
export const getTokenUrl = (server: string) => server + OAUTH_CONFIG.ENDPOINTS.TOKEN
export const getUserinfoUrl = (server: string) => server + OAUTH_CONFIG.ENDPOINTS.USERINFO
export const getLogoutUrl = (server: string) => server + OAUTH_CONFIG.ENDPOINTS.LOGOUT
