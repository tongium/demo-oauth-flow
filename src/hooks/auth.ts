import jwt_decode from 'jwt-decode'
import { OAuthClient } from '../services/oauth-client'
import { OAUTH_CONFIG, getCallbackUrl } from '../config/oauth'
import { StorageKeys, storage } from '../lib/storage'
import { OAuthError, getErrorMessage } from '../lib/errors'
import type { OAuthConfig, IdTokenPayload, OAuthEndpoints, ShareableSettings } from '../types'
import { readSettingsFromUrl, clearSettingsFromUrl } from '../lib/settings-share'

// Export for backward compatibility
export const CALLBACK_URL = getCallbackUrl()
export const AUTHORIZATION_PATH = OAUTH_CONFIG.ENDPOINTS.AUTHORIZATION
export const TOKEN_PATH = OAUTH_CONFIG.ENDPOINTS.TOKEN
export const USERINFO_PATH = OAUTH_CONFIG.ENDPOINTS.USERINFO
export const LOGOUT_PATH = OAUTH_CONFIG.ENDPOINTS.LOGOUT

/**
 * Clear all authentication data
 */
export const cleanup = () => {
    storage.clearAuth()
}

/**
 * Configuration management
 */
export const setAuthServer = (server: string) => {
    storage.save(StorageKeys.SERVER, server)
}

export const getAuthServer = (): string => {
    return storage.get(StorageKeys.SERVER) || OAUTH_CONFIG.DEFAULT_SERVER
}

export const setAuthClientID = (clientId: string) => {
    storage.save(StorageKeys.CLIENT_ID, clientId)
}

export const getAuthClientID = (): string => {
    return storage.get(StorageKeys.CLIENT_ID) || OAUTH_CONFIG.DEFAULT_CLIENT_ID
}

export const setAuthScope = (scope: string) => {
    storage.save(StorageKeys.SCOPE, scope)
}

export const getAuthScope = (): string => {
    return storage.get(StorageKeys.SCOPE) || OAUTH_CONFIG.DEFAULT_SCOPE
}

/**
 * Endpoint configuration management
 */
export const setAuthEndpoints = (endpoints: OAuthEndpoints) => {
    storage.save(StorageKeys.ENDPOINT_AUTHORIZATION, endpoints.authorization)
    storage.save(StorageKeys.ENDPOINT_TOKEN, endpoints.token)
    storage.save(StorageKeys.ENDPOINT_USERINFO, endpoints.userinfo)
    storage.save(StorageKeys.ENDPOINT_LOGOUT, endpoints.logout)
}

export const getAuthEndpoints = (): OAuthEndpoints => {
    return {
        authorization: storage.get(StorageKeys.ENDPOINT_AUTHORIZATION) || OAUTH_CONFIG.ENDPOINTS.AUTHORIZATION,
        token: storage.get(StorageKeys.ENDPOINT_TOKEN) || OAUTH_CONFIG.ENDPOINTS.TOKEN,
        userinfo: storage.get(StorageKeys.ENDPOINT_USERINFO) || OAUTH_CONFIG.ENDPOINTS.USERINFO,
        logout: storage.get(StorageKeys.ENDPOINT_LOGOUT) || OAUTH_CONFIG.ENDPOINTS.LOGOUT,
    }
}

/**
 * Import all settings from shareable settings object
 */
export const importSettings = (settings: ShareableSettings) => {
    setAuthServer(settings.server)
    setAuthClientID(settings.clientId)
    setAuthScope(settings.scope)
    setAuthEndpoints(settings.endpoints)
}

/**
 * Export all settings as shareable settings object
 */
export const exportSettings = (): ShareableSettings => {
    return {
        server: getAuthServer(),
        clientId: getAuthClientID(),
        scope: getAuthScope(),
        endpoints: getAuthEndpoints(),
    }
}

/**
 * Initialize settings from URL query string if present
 */
export const initializeFromUrl = () => {
    const settings = readSettingsFromUrl()
    if (settings) {
        importSettings(settings)
        clearSettingsFromUrl()
        return true
    }
    return false
}

/**
 * Get current OAuth configuration
 */
const getOAuthConfig = (): OAuthConfig => ({
    server: getAuthServer(),
    clientId: getAuthClientID(),
    scope: getAuthScope(),
    endpoints: getAuthEndpoints(),
})

/**
 * Token getters
 */
export const useIDToken = (): string | null => {
    return storage.get(StorageKeys.ID_TOKEN)
}

export const useAccessToken = (): string | null => {
    return storage.get(StorageKeys.ACCESS_TOKEN)
}

export const useReadRefreshToken = (): string | null => {
    return storage.get(StorageKeys.REFRESH_TOKEN)
}

/**
 * Initiate OAuth login flow
 * Redirects to authorization server
 */
export const useLogin = () => {
    try {
        const config = getOAuthConfig()
        const { url } = OAuthClient.getAuthorizationUrl(config)
        location.href = url
    } catch (error) {
        const message = getErrorMessage(error)
        alert(`Failed to initiate login: ${message}`)
    }
}

/**
 * Logout and redirect to authorization server logout endpoint
 */
export const useLogout = () => {
    try {
        const idToken = storage.get(StorageKeys.ID_TOKEN)
        const config = getOAuthConfig()
        storage.clearAuth()
        const logoutUrl = OAuthClient.getLogoutUrl(config, idToken, OAUTH_CONFIG.BASE_URL)
        location.href = logoutUrl
    } catch (error) {
        const message = getErrorMessage(error)
        alert(`Failed to logout: ${message}`)
    }
}

/**
 * Exchange authorization code for tokens
 * Called from the callback route after OAuth redirect
 */
export const useRequestTokensByAuthorizationCode = async (code: string): Promise<void> => {
    try {
        const config = getOAuthConfig()
        const tokens = await OAuthClient.exchangeAuthorizationCode(code, config)

        storage.save(StorageKeys.ACCESS_TOKEN, tokens.access_token)
        storage.save(StorageKeys.ID_TOKEN, tokens.id_token)
        storage.save(StorageKeys.REFRESH_TOKEN, tokens.refresh_token)
        storage.save(StorageKeys.TOKEN_TYPE, tokens.token_type)
    } catch (error) {
        const message = getErrorMessage(error)
        alert(`Token exchange failed: ${message}`)
    } finally {
        // Always redirect back to home
        location.href = OAUTH_CONFIG.BASE_URL
    }
}

/**
 * Refresh access token using refresh token
 */
export const useRefreshToken = async (): Promise<void> => {
    try {
        const config = getOAuthConfig()
        const refreshToken = storage.get(StorageKeys.REFRESH_TOKEN)

        if (!refreshToken) {
            throw new Error('No refresh token available')
        }

        const tokens = await OAuthClient.refreshAccessToken(config, refreshToken)

        storage.save(StorageKeys.ACCESS_TOKEN, tokens.access_token)
        storage.save(StorageKeys.ID_TOKEN, tokens.id_token)
        storage.save(StorageKeys.REFRESH_TOKEN, tokens.refresh_token)
        storage.save(StorageKeys.TOKEN_TYPE, tokens.token_type)
    } catch (error) {
        const message = getErrorMessage(error)
        console.error(`Token refresh failed: ${message}`)
        throw error
    }
}

/**
 * Fetch user information from userinfo endpoint
 */
export const useUserInfo = async (): Promise<object> => {
    try {
        const config = getOAuthConfig()
        const accessToken = storage.get(StorageKeys.ACCESS_TOKEN)
        const tokenType = storage.get(StorageKeys.TOKEN_TYPE) || 'Bearer'

        if (!accessToken) {
            throw new Error('No access token available')
        }

        return await OAuthClient.getUserInfo(config, accessToken, tokenType)
    } catch (error) {
        const message = getErrorMessage(error)
        console.error(`Failed to fetch user info: ${message}`)
        throw error
    }
}

/**
 * Check if user is currently logged in
 * Validates that ID token exists and is not expired
 */
export const useIsLogin = (): boolean => {
    const idToken = storage.get(StorageKeys.ID_TOKEN)
    if (idToken) {
        try {
            const payload = jwt_decode<IdTokenPayload>(idToken)
            if (payload && payload.exp && payload.exp > Date.now() / 1000) {
                return true
            }
        } catch (error) {
            console.error('Failed to validate ID token:', error)
        }
    }

    return false
}
