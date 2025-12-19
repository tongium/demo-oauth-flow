/**
 * OAuth Token types and interfaces
 */

export interface TokenPayload {
    access_token: string
    id_token: string
    refresh_token: string
    token_type: string
    expires_in?: number
}

export interface TokenResponse {
    access_token: string
    id_token: string
    refresh_token: string
    token_type: string
}

export interface IdTokenPayload {
    sub: string
    aud?: string
    iss?: string
    iat?: number
    exp?: number
    [key: string]: any
}

export interface UserInfo {
    sub: string
    email?: string
    name?: string
    [key: string]: any
}

export interface OAuthEndpoints {
    authorization: string
    token: string
    userinfo: string
    logout: string
}

export interface OAuthConfig {
    server: string
    clientId: string
    scope: string
    endpoints?: OAuthEndpoints
}

export interface AuthState {
    challenge: string
    state: string
}

/**
 * Settings that can be shared via URL
 */
export interface ShareableSettings {
    server: string
    clientId: string
    scope: string
    endpoints: OAuthEndpoints
}
