/**
 * Cryptographic utilities for OAuth PKCE flow
 * Uses Web Crypto API for secure random generation
 */

import CryptoJS from 'crypto-js'

/**
 * Generate a cryptographically secure random string
 * Uses crypto.getRandomValues() instead of Math.random()
 */
export function generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    const charsetLength = charset.length
    const values = new Uint8Array(length)

    // Use Web Crypto API for secure random values
    crypto.getRandomValues(values)

    let result = ''
    for (let i = 0; i < length; i++) {
        result += charset[values[i] % charsetLength]
    }

    return result
}

/**
 * Create PKCE code challenge from code verifier
 * Uses SHA256 hashing as per OAuth 2.0 PKCE spec (RFC 7636)
 */
export function createCodeChallenge(verifier: string): string {
    return CryptoJS.SHA256(verifier).toString(CryptoJS.enc.Base64url)
}

/**
 * Generate PKCE pair (verifier and challenge)
 */
export function generatePKCEPair(challengeLength: number = 43) {
    const verifier = generateRandomString(challengeLength)
    const challenge = createCodeChallenge(verifier)

    return { verifier, challenge }
}

/**
 * Generate state parameter for OAuth flow
 */
export function generateState(length: number = 32): string {
    return generateRandomString(length)
}
