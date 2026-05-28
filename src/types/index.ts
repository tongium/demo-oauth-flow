/**
 * OAuth Token Types
 * 
 * These interfaces define the shape of data we get back from the 
 * Authorization Server after a successful login or token refresh.
 */

export interface TokenPayload {
    /** The main token used to access protected APIs */
    access_token: string
    /** A token containing user identity details (encoded as a JWT) */
    id_token: string
    /** A long-lived token used to get new access tokens later */
    refresh_token: string
    /** Usually "Bearer" */
    token_type: string
    /** Optional: Seconds until the access token expires */
    expires_in?: number
}

/**
 * ID Token Payload
 * 
 * When we decode the `id_token`, we get an object with these properties.
 * These are often called "Claims".
 */
export interface IdTokenPayload {
    /** The "Subject" - a unique ID for the user */
    sub: string
    /** The "Audience" - who this token is intended for (usually our Client ID) */
    aud?: string
    /** The "Issuer" - the URL of the server that created this token */
    iss?: string
    /** "Issued At" - timestamp of when the token was created */
    iat?: number
    /** "Expiration" - timestamp of when the token will stop being valid */
    exp?: number
    /** Any other custom fields the server might include */
    [key: string]: any
}

/**
 * User Info
 * 
 * Data returned from the /userinfo endpoint. 
 * Usually contains the user's profile details.
 */
export interface UserInfo {
    /** The unique user ID (should match 'sub' in the ID token) */
    sub: string
    /** The user's email address */
    email?: string
    /** The user's full name */
    name?: string
    /** Other profile fields like 'picture', 'locale', etc. */
    [key: string]: any
}

/**
 * OAuth Server Endpoints
 * 
 * The specific URLs we need to talk to for each part of the OAuth flow.
 */
export interface OAuthEndpoints {
    /** Where we send the user to log in */
    authorization: string
    /** Where we exchange codes for tokens */
    token: string
    /** Where we get user profile data */
    userinfo: string
    /** Where we send the user to log out of the server */
    logout: string
    /** Where we tell the server to invalidate a token */
    revoke: string
}

/**
 * Main OAuth Configuration
 * 
 * Everything the app needs to know to connect to an OAuth server.
 */
export interface OAuthConfig {
    /** The root URL of the server */
    server: string
    /** Our app's unique ID on that server */
    clientId: string
    /** The permissions we are requesting */
    scope: string
    /** The specific URLs for the server's APIs */
    endpoints: OAuthEndpoints
}

/**
 * Shareable Settings
 * 
 * A subset of configuration that is safe to share via a URL.
 */
export interface ShareableSettings {
    server: string
    clientId: string
    scope: string
    endpoints: OAuthEndpoints
}
