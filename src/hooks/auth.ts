/**
 * Authentication Service Layer
 * 
 * This file provides the primary functions used by the UI to interact with
 * the authentication system. It manages configuration, token storage, and
 * high-level actions like "Login" and "Logout".
 */

import * as OAuthLogic from '../services/oauth-client'
import { OAUTH_CONFIG, getRedirectUrl, getPostLogoutRedirectURL } from '../config/oauth'
import { StorageKeys, storage } from '../lib/storage'
import { OAuthError, getErrorMessage } from '../lib/errors'
import type { OAuthConfig, OAuthEndpoints, ShareableSettings, TokenPayload } from '../types'
import { readSettingsFromUrl, clearSettingsFromUrl } from '../lib/settings-share'

/**
 * --------------------------------------------------------------------------
 * SECTION 1: STORAGE & CLEANUP
 * --------------------------------------------------------------------------
 */

/**
 * Completely clears all authentication-related data from the browser.
 */
export const clearAllAuthData = () => {
    storage.clearAuth()
}

/**
 * --------------------------------------------------------------------------
 * SECTION 2: CONFIGURATION MANAGEMENT
 * --------------------------------------------------------------------------
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
 * Manages the specific URLs (endpoints) for the OAuth server.
 */
export const setAuthEndpoints = (endpoints: OAuthEndpoints) => {
    storage.save(StorageKeys.ENDPOINT_AUTHORIZATION, endpoints.authorization)
    storage.save(StorageKeys.ENDPOINT_TOKEN, endpoints.token)
    storage.save(StorageKeys.ENDPOINT_USERINFO, endpoints.userinfo)
    storage.save(StorageKeys.ENDPOINT_LOGOUT, endpoints.logout)
    storage.save(StorageKeys.ENDPOINT_REVOKE, endpoints.revoke)
}

/**
 * Fetches default endpoint configuration from a server's 
 * .well-known/openid-configuration endpoint.
 */
export const fetchDefaultEndpoints = async (server: string): Promise<OAuthEndpoints> => {
    const response = await fetch(server + '/.well-known/openid-configuration')
    if (!response.ok) {
        throw new OAuthError(`Failed to fetch OIDC configuration: ${response.status} ${response.statusText}`, 'OIDC_CONFIG_ERROR', response.status)
    }
    const config = await response.json()
    return {
        authorization: config.authorization_endpoint,
        token: config.token_endpoint,
        userinfo: config.userinfo_endpoint,
        logout: config.end_session_endpoint,
        revoke: config.revocation_endpoint,
    }
}

let cachedEndpoints: OAuthEndpoints | null = null
export const loadCachedEndpoints = async (): Promise<OAuthEndpoints> => {
    if (!cachedEndpoints) {
        cachedEndpoints = await fetchDefaultEndpoints(getAuthServer())
    }

    return cachedEndpoints
}

const hasStoredEndpoints = (): boolean => {
    return Boolean(
        storage.get(StorageKeys.ENDPOINT_AUTHORIZATION) &&
        storage.get(StorageKeys.ENDPOINT_TOKEN) &&
        storage.get(StorageKeys.ENDPOINT_USERINFO) &&
        storage.get(StorageKeys.ENDPOINT_LOGOUT) &&
        storage.get(StorageKeys.ENDPOINT_REVOKE),
    )
}

export const getAuthEndpoints = (): OAuthEndpoints => {
    return {
        authorization: storage.get(StorageKeys.ENDPOINT_AUTHORIZATION) || cachedEndpoints?.authorization || 'N/A',
        token: storage.get(StorageKeys.ENDPOINT_TOKEN) || cachedEndpoints?.token || 'N/A',
        userinfo: storage.get(StorageKeys.ENDPOINT_USERINFO) || cachedEndpoints?.userinfo || 'N/A',
        logout: storage.get(StorageKeys.ENDPOINT_LOGOUT) || cachedEndpoints?.logout || 'N/A',
        revoke: storage.get(StorageKeys.ENDPOINT_REVOKE) || cachedEndpoints?.revoke || 'N/A',
    }
}

/**
 * Import/Export all settings at once (e.g., from/to a URL).
 */
export const importSettings = (settings: ShareableSettings) => {
    setAuthServer(settings.server)
    setAuthClientID(settings.clientId)
    setAuthScope(settings.scope)
    setAuthEndpoints(settings.endpoints)
}

export const exportSettings = (): ShareableSettings => {
    return {
        server: getAuthServer(),
        clientId: getAuthClientID(),
        scope: getAuthScope(),
        endpoints: getAuthEndpoints(),
    }
}

/**
 * Looks at the URL to see if it contains settings shared by someone else.
 */
export const initializeSettingsFromUrl = () => {
    const settings = readSettingsFromUrl()
    if (settings) {
        importSettings(settings)
        clearSettingsFromUrl()
        return true
    }
    return false
}

let initializeSettingsPromise: Promise<void> | null = null
export const initializeAuthSettings = async (): Promise<void> => {
    if (!initializeSettingsPromise) {
        initializeSettingsPromise = (async () => {
            const loadedFromUrl = initializeSettingsFromUrl()
            if (loadedFromUrl || hasStoredEndpoints()) {
                return
            }

            const endpoints = await loadCachedEndpoints()
            setAuthEndpoints(endpoints)
        })().finally(() => {
            initializeSettingsPromise = null
        })
    }

    return initializeSettingsPromise
}

/**
 * Helper to get the full current OAuth configuration object.
 */
const getCurrentOAuthConfig = (): OAuthConfig => ({
    server: getAuthServer(),
    clientId: getAuthClientID(),
    scope: getAuthScope(),
    endpoints: getAuthEndpoints(),
})

/**
 * --------------------------------------------------------------------------
 * SECTION 3: TOKEN MANAGEMENT
 * --------------------------------------------------------------------------
 */

/**
 * Saves all received tokens to browser storage.
 */
const saveTokensToStorage = (tokens: TokenPayload): void => {
    storage.save(StorageKeys.ACCESS_TOKEN, tokens.access_token)
    storage.save(StorageKeys.ID_TOKEN, tokens.id_token)
    storage.save(StorageKeys.REFRESH_TOKEN, tokens.refresh_token)
    storage.save(StorageKeys.TOKEN_TYPE, tokens.token_type)
}

/**
 * Removes all tokens from browser storage.
 */
export const clearTokensFromStorage = (): void => {
    storage.remove(StorageKeys.ACCESS_TOKEN)
    storage.remove(StorageKeys.ID_TOKEN)
    storage.remove(StorageKeys.REFRESH_TOKEN)
    storage.remove(StorageKeys.TOKEN_TYPE)
}

/**
 * Helpers to get specific tokens from storage.
 */
export const getIDToken = (): string | null => {
    return storage.get(StorageKeys.ID_TOKEN)
}

export const getAccessToken = (): string | null => {
    return storage.get(StorageKeys.ACCESS_TOKEN)
}

export const getRefreshToken = (): string | null => {
    return storage.get(StorageKeys.REFRESH_TOKEN)
}

/**
 * --------------------------------------------------------------------------
 * SECTION 4: AUTHENTICATION ACTIONS
 * --------------------------------------------------------------------------
 */

/**
 * Starts the login process by redirecting the user to the auth server.
 */
export const performLogin = async () => {
    await initializeAuthSettings()
    const config = getCurrentOAuthConfig()
    const { url } = OAuthLogic.getAuthorizationUrl(config)
    location.href = url
}

/**
 * Logs the user out locally and redirects them to the auth server's logout page.
 */
export const performLogout = () => {
    const idToken = storage.get(StorageKeys.ID_TOKEN)
    const config = getCurrentOAuthConfig()
    const logoutUrl = OAuthLogic.getLogoutUrl(config, idToken, getPostLogoutRedirectURL())
    location.href = logoutUrl
}

/**
 * After login redirect, this exchanges the "code" in the URL for actual tokens.
 */
export const exchangeCodeForTokens = async (code: string): Promise<void> => {
    const config = getCurrentOAuthConfig()
    const tokens = await OAuthLogic.exchangeAuthorizationCode(code, config)
    saveTokensToStorage(tokens)
}

/**
 * Uses a refresh token to get a fresh access token without user interaction.
 */
export const refreshAccessToken = async (): Promise<void> => {
    try {
        const config = getCurrentOAuthConfig()
        const refreshToken = storage.get(StorageKeys.REFRESH_TOKEN)

        if (!refreshToken) {
            throw new Error('No refresh token available')
        }

        const tokens = await OAuthLogic.refreshAccessToken(config, refreshToken)
        saveTokensToStorage(tokens)
    } catch (error) {
        const message = getErrorMessage(error)
        console.error(`Token refresh failed: ${message}`)
        throw error
    }
}

/**
 * Fetches the user's profile information from the server.
 */
export const fetchUserInfo = async (): Promise<object> => {
    try {
        const config = getCurrentOAuthConfig()
        const accessToken = storage.get(StorageKeys.ACCESS_TOKEN)
        const tokenType = storage.get(StorageKeys.TOKEN_TYPE) || 'Bearer'

        if (!accessToken) {
            throw new Error('No access token available')
        }

        return await OAuthLogic.getUserInfo(config, accessToken, tokenType)
    } catch (error) {
        const message = getErrorMessage(error)
        console.error(`Failed to fetch user info: ${message}`)
        throw error
    }
}

/**
 * Tells the server that the refresh token should no longer be valid.
 */
export const revokeRefreshToken = async (): Promise<void> => {
    const config = getCurrentOAuthConfig()
    const refreshToken = storage.get(StorageKeys.REFRESH_TOKEN)

    if (!refreshToken) {
        throw new Error('No refresh token available')
    }

    await OAuthLogic.revokeToken(config, refreshToken, 'refresh_token')
    clearTokensFromStorage()
}

/**
 * Checks if the user is currently logged in by trying to fetch their info.
 */
export const isUserLoggedIn = async (): Promise<boolean> => {
    try {
        const config = getCurrentOAuthConfig()
        const accessToken = storage.get(StorageKeys.ACCESS_TOKEN)
        const tokenType = storage.get(StorageKeys.TOKEN_TYPE) || 'Bearer'
        
        if (!accessToken) return false
        
        // If we can get user info, we are definitely logged in
        await OAuthLogic.getUserInfo(config, accessToken, tokenType)
        return true
    } catch {
        // If it fails, assume the token is invalid and clear it
        clearTokensFromStorage()
        return false
    }
}
