/**
 * Storage abstraction layer
 * Provides a centralized way to manage localStorage for OAuth tokens and config
 */

export const StorageKeys = {
    SERVER: 'auth.server',
    CLIENT_ID: 'auth.client_id',
    SCOPE: 'auth.scope',

    // OAuth endpoints
    ENDPOINT_AUTHORIZATION: 'auth.endpoint.authorization',
    ENDPOINT_TOKEN: 'auth.endpoint.token',
    ENDPOINT_USERINFO: 'auth.endpoint.userinfo',
    ENDPOINT_LOGOUT: 'auth.endpoint.logout',

    // Token storage
    ID_TOKEN: 'auth.id_token',
    REFRESH_TOKEN: 'auth.refresh_token',
    ACCESS_TOKEN: 'auth.access_token',
    TOKEN_TYPE: 'auth.token_type',

    // PKCE challenge and state
    CHALLENGE: 'auth.challenge',
    STATE: 'auth.state',
} as const

class StorageManager {
    /**
     * Save a value to localStorage
     */
    save(key: string, value: string): void {
        try {
            localStorage.setItem(key, value)
        } catch (error) {
            console.error(`Failed to save to localStorage: ${key}`, error)
            throw new Error(`Storage write failed for key: ${key}`)
        }
    }

    /**
     * Get a value from localStorage
     */
    get(key: string): string | null {
        try {
            return localStorage.getItem(key)
        } catch (error) {
            console.error(`Failed to read from localStorage: ${key}`, error)
            return null
        }
    }

    /**
     * Remove a value from localStorage
     */
    remove(key: string): void {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error(`Failed to remove from localStorage: ${key}`, error)
        }
    }

    /**
     * Clear all OAuth-related data
     */
    clearAuth(): void {
        Object.values(StorageKeys).forEach(key => this.remove(key))
    }

    /**
     * Clear everything from localStorage
     */
    clear(): void {
        try {
            localStorage.clear()
        } catch (error) {
            console.error('Failed to clear localStorage', error)
        }
    }
}

export const storage = new StorageManager()
