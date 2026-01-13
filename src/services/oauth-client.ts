/**
 * OAuth 2.0 Client Service
 * Handles all OAuth API communication with the authorization server
 */

import { OAUTH_CONFIG, getRedirectUrl } from '../config/oauth'
import { generatePKCEPair, generateState } from '../lib/crypto'
import { OAuthError, TokenExchangeError, ValidationError } from '../lib/errors'
import { storage, StorageKeys } from '../lib/storage'
import type { TokenPayload, UserInfo, OAuthConfig } from '../types'

export class OAuthClient {
    /**
     * Get full authorization URL for redirecting user to OAuth server
     */
    static getAuthorizationUrl(config: OAuthConfig): { url: string; pkce: { verifier: string; challenge: string }; state: string } {
        const { server, clientId, scope, endpoints } = config
        const pkce = generatePKCEPair(OAUTH_CONFIG.PKCE.CHALLENGE_LENGTH)
        const state = generateState(OAUTH_CONFIG.PKCE.STATE_LENGTH)

        // Store for later verification
        storage.save(StorageKeys.CHALLENGE, pkce.verifier)
        storage.save(StorageKeys.STATE, state)

        // Use custom endpoint if provided, otherwise use default
        const authEndpoint = endpoints?.authorization || OAUTH_CONFIG.ENDPOINTS.AUTHORIZATION
        const url = new URL(server + authEndpoint)
        url.searchParams.append('client_id', clientId)
        url.searchParams.append('redirect_uri', getRedirectUrl())
        url.searchParams.append('response_type', 'code')
        url.searchParams.append('scope', scope)
        url.searchParams.append('state', state)
        url.searchParams.append('code_challenge', pkce.challenge)
        url.searchParams.append('code_challenge_method', OAUTH_CONFIG.PKCE.CODE_CHALLENGE_METHOD)

        return { url: url.toString(), pkce, state }
    }

    /**
     * Exchange authorization code for tokens
     */
    static async exchangeAuthorizationCode(
        code: string,
        config: OAuthConfig
    ): Promise<TokenPayload> {
        const challenge = storage.get(StorageKeys.CHALLENGE)
        if (!challenge) {
            throw new ValidationError('Missing code challenge. Please restart the login process.')
        }

        const data = new URLSearchParams()
        data.set('grant_type', 'authorization_code')
        data.set('code', code)
        data.set('client_id', config.clientId)
        data.set('code_verifier', challenge)
        data.set('redirect_uri', getRedirectUrl())

        const tokenEndpoint = config.endpoints?.token || OAUTH_CONFIG.ENDPOINTS.TOKEN
        try {
            const response = await fetch(config.server + tokenEndpoint, {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                },
            })

            const payload = await response.json()

            if (!response.ok) {
                const errorMsg = payload.error_description || payload.error || 'Failed to exchange authorization code'
                throw new TokenExchangeError(errorMsg, payload.error)
            }

            if (!payload.access_token || !payload.id_token) {
                throw new TokenExchangeError('Invalid token response from server')
            }

            return payload as TokenPayload
        } catch (error) {
            if (error instanceof OAuthError) {
                throw error
            }
            throw new TokenExchangeError(
                `Failed to exchange authorization code: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    /**
     * Refresh access token using refresh token
     */
    static async refreshAccessToken(
        config: OAuthConfig,
        refreshToken: string
    ): Promise<TokenPayload> {
        if (!refreshToken) {
            throw new ValidationError('No refresh token available')
        }

        const data = new URLSearchParams()
        data.set('grant_type', 'refresh_token')
        data.set('client_id', config.clientId)
        data.set('refresh_token', refreshToken)

        const tokenEndpoint = config.endpoints?.token || OAUTH_CONFIG.ENDPOINTS.TOKEN
        try {
            const response = await fetch(config.server + tokenEndpoint, {
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
     * Get user information from userinfo endpoint
     */
    static async getUserInfo(config: OAuthConfig, accessToken: string, tokenType: string = 'Bearer'): Promise<UserInfo> {
        if (!accessToken) {
            throw new ValidationError('No access token available')
        }

        const userinfoEndpoint = config.endpoints?.userinfo || OAUTH_CONFIG.ENDPOINTS.USERINFO
        try {
            const response = await fetch(config.server + userinfoEndpoint, {
                method: 'GET',
                headers: {
                    Authorization: `${tokenType} ${accessToken}`,
                },
            })

            if (!response.ok) {
                throw new OAuthError(`Failed to fetch user info: ${response.statusText}`, undefined, response.status)
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
     * Build logout URL
     */
    static getLogoutUrl(config: OAuthConfig, idToken: string | null, redirectUri: string): string {
        const logoutEndpoint = config.endpoints?.logout || OAUTH_CONFIG.ENDPOINTS.LOGOUT
        const url = new URL(config.server + logoutEndpoint)

        if (idToken) {
            url.searchParams.append('post_logout_redirect_uri', redirectUri)
            url.searchParams.append('id_token_hint', idToken)
        }

        url.searchParams.append('client_id', config.clientId) // legacy
        url.searchParams.append('redirect_uri', redirectUri) // legacy
        return url.toString()
    }

    /**
     * Revoke access token or refresh token
     */
    static async revokeToken(
        config: OAuthConfig,
        token: string,
        tokenTypeHint?: 'access_token' | 'refresh_token',
    ): Promise<void> {
        if (!token) {
            return
        }

        const data = new URLSearchParams()
        data.set('token', token)
        data.set('client_id', config.clientId)
        if (tokenTypeHint) {
            data.set('token_type_hint', tokenTypeHint)
        }

        const revokeEndpoint = config.endpoints?.revoke || OAUTH_CONFIG.ENDPOINTS.REVOKE
        try {
            const response = await fetch(config.server + revokeEndpoint, {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'Authorization': `Bearer ${token}`
                },
            })

            if (!response.ok) {
                // RFC 7009 says revocations should return 200 even if the token is invalid,
                // but we'll log or throw if the server returns an actual error status
                console.warn(`Revocation endpoint returned ${response.status}: ${response.statusText}`)
            }
        } catch (error) {
            console.error('Failed to revoke token', error)
            // Revocation is best-effort, usually during logout, so we often suppress errors here
            // or rethrow if your app policy requires it.
            throw error
        }
    }
}
