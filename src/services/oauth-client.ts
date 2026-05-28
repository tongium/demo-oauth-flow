/**
 * OAuth 2.0 Client Logic
 * 
 * This file contains the core logic for communicating with an OAuth 2.0 
 * Authorization Server. It handles redirecting users to login, exchanging 
 * authorization codes for tokens, and refreshing those tokens.
 */

import { OAUTH_CONFIG, getRedirectUrl } from '../config/oauth'
import { generatePKCEPair, generateState } from '../lib/crypto'
import { OAuthError, TokenExchangeError, ValidationError } from '../lib/errors'
import { storage, StorageKeys } from '../lib/storage'
import type { TokenPayload, UserInfo, OAuthConfig } from '../types'

/**
 * 1. GETTING THE LOGIN URL
 * 
 * This function builds the URL where the user will be redirected to log in.
 * It also prepares security measures like PKCE (Proof Key for Code Exchange)
 * and a "state" string to prevent certain types of attacks.
 */
export function getAuthorizationUrl(config: OAuthConfig): { 
    url: string; 
    codeVerifier: string; 
    codeChallenge: string; 
    state: string 
} {
    const { clientId, scope, endpoints } = config
    
    // PKCE is a security layer for public clients like this web app.
    // It involves generating a random "verifier" and a "challenge" derived from it.
    const pkce = generatePKCEPair(OAUTH_CONFIG.PKCE.CHALLENGE_LENGTH)
    
    // "State" is a random string we send to the server and expect back 
    // to ensure the response we get is from the request we made.
    const state = generateState(OAUTH_CONFIG.PKCE.STATE_LENGTH)

    // We store the verifier and state in local storage so we can check them 
    // when the user is redirected back to our app.
    storage.save(StorageKeys.CHALLENGE, pkce.verifier)
    storage.save(StorageKeys.STATE, state)

    const authEndpoint = endpoints.authorization
    const url = new URL(authEndpoint)
    
    // Add all required OAuth parameters to the URL query string
    url.searchParams.append('client_id', clientId)
    url.searchParams.append('redirect_uri', getRedirectUrl())
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('scope', scope)
    url.searchParams.append('state', state)
    url.searchParams.append('code_challenge', pkce.challenge)
    url.searchParams.append('code_challenge_method', OAUTH_CONFIG.PKCE.CODE_CHALLENGE_METHOD)

    return { 
        url: url.toString(), 
        codeVerifier: pkce.verifier, 
        codeChallenge: pkce.challenge, 
        state 
    }
}

/**
 * 2. EXCHANGING CODE FOR TOKENS
 * 
 * After the user logs in at the server, they are sent back to our app with
 * a "code". This function takes that code and sends it back to the server
 * (behind the scenes) to get the actual Access and ID tokens.
 */
export async function exchangeAuthorizationCode(
    code: string,
    config: OAuthConfig
): Promise<TokenPayload> {
    // Retrieve the verifier we saved earlier to prove we are the same app
    // that started the login flow.
    const verifier = storage.get(StorageKeys.CHALLENGE)
    if (!verifier) {
        throw new ValidationError('Missing security challenge. Please try logging in again.')
    }

    const data = new URLSearchParams()
    data.set('grant_type', 'authorization_code')
    data.set('code', code)
    data.set('client_id', config.clientId)
    data.set('code_verifier', verifier)
    data.set('redirect_uri', getRedirectUrl())

    const tokenEndpoint = config.endpoints.token
    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        const payload = await response.json()

        if (!response.ok) {
            const errorMsg = payload.error_description || payload.error || 'Failed to get tokens'
            throw new TokenExchangeError(errorMsg, payload.error)
        }

        if (!payload.access_token || !payload.id_token) {
            throw new TokenExchangeError('The server did not return the expected tokens.')
        }

        return payload as TokenPayload
    } catch (error) {
        if (error instanceof OAuthError) {
            throw error
        }
        throw new TokenExchangeError(
            `Failed to exchange code: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}

/**
 * 3. REFRESHING ACCESS TOKENS
 * 
 * Access tokens are short-lived. This function uses a "Refresh Token"
 * to get a new Access Token without asking the user to log in again.
 */
export async function refreshAccessToken(
    config: OAuthConfig,
    refreshToken: string
): Promise<TokenPayload> {
    if (!refreshToken) {
        throw new ValidationError('No refresh token found.')
    }

    const data = new URLSearchParams()
    data.set('grant_type', 'refresh_token')
    data.set('client_id', config.clientId)
    data.set('refresh_token', refreshToken)

    const tokenEndpoint = config.endpoints.token
    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        const payload = await response.json()

        if (!response.ok) {
            const errorMsg = payload.error_description || payload.error || 'Failed to refresh token'
            throw new TokenExchangeError(errorMsg, payload.error)
        }

        return payload as TokenPayload
    } catch (error) {
        if (error instanceof OAuthError) {
            throw error
        }
        throw new TokenExchangeError(
            `Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}

/**
 * 4. FETCHING USER INFORMATION
 * 
 * Uses the Access Token to get basic profile details about the user
 * from the server's userinfo endpoint.
 */
export async function getUserInfo(
    config: OAuthConfig, 
    accessToken: string, 
    tokenType: string = 'Bearer'
): Promise<UserInfo> {
    if (!accessToken) {
        throw new ValidationError('No access token available.')
    }

    const userinfoEndpoint = config.endpoints.userinfo
    try {
        const response = await fetch(userinfoEndpoint, {
            method: 'GET',
            headers: {
                Authorization: `${tokenType} ${accessToken}`,
            },
        })

        if (!response.ok) {
            throw new OAuthError(`Could not get user info: ${response.statusText}`, undefined, response.status)
        }

        return (await response.json()) as UserInfo
    } catch (error) {
        if (error instanceof OAuthError) {
            throw error
        }
        throw new OAuthError(
            `Failed to fetch user info: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}

/**
 * 5. BUILDING THE LOGOUT URL
 * 
 * Creates a URL that we redirect the user to when they want to log out
 * of the server-side session.
 */
export function getLogoutUrl(config: OAuthConfig, idToken: string | null, redirectUri: string): string {
    const logoutEndpoint = config.endpoints.logout
    const url = new URL(logoutEndpoint)

    // Many servers require the id_token_hint to know which user to log out
    if (idToken) {
        url.searchParams.append('post_logout_redirect_uri', redirectUri)
        url.searchParams.append('id_token_hint', idToken)
    }

    // Some older servers might expect these
    url.searchParams.append('client_id', config.clientId)
    url.searchParams.append('redirect_uri', redirectUri)
    
    return url.toString()
}

/**
 * 6. REVOKING TOKENS
 * 
 * Tells the server to invalidate a token so it can no longer be used.
 * Usually done during logout for better security.
 */
export async function revokeToken(
    config: OAuthConfig,
    token: string,
    tokenTypeHint?: 'access_token' | 'refresh_token',
): Promise<void> {
    if (!token) return

    const data = new URLSearchParams()
    data.set('token', token)
    data.set('client_id', config.clientId)
    if (tokenTypeHint) {
        data.set('token_type_hint', tokenTypeHint)
    }

    const revokeEndpoint = config.endpoints.revoke
    try {
        const response = await fetch(revokeEndpoint, {
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Authorization': `Bearer ${token}`
            },
        })

        if (!response.ok) {
            console.warn(`Token revocation might have failed: ${response.status} ${response.statusText}`)
        }
    } catch (error) {
        console.error('Failed to revoke token:', error)
        throw error
    }
}
