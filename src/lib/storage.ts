/**
 * Browser Storage Helpers
 * 
 * This file provides a simple way to save and retrieve data from the 
 * browser's "localStorage". We use this to keep track of tokens and 
 * settings even if the user refreshes the page.
 */

/**
 * These are the "keys" we use to label our data in localStorage.
 * Using a central list helps prevent typos and accidental overwrites.
 */
export const StorageKeys = {
    // App Configuration
    SERVER: 'auth.server',
    CLIENT_ID: 'auth.client_id',
    SCOPE: 'auth.scope',

    // OAuth Server Endpoints
    ENDPOINT_AUTHORIZATION: 'auth.endpoint.authorization',
    ENDPOINT_TOKEN: 'auth.endpoint.token',
    ENDPOINT_USERINFO: 'auth.endpoint.userinfo',
    ENDPOINT_LOGOUT: 'auth.endpoint.logout',
    ENDPOINT_REVOKE: 'auth.endpoint.revoke',

    // Tokens
    ID_TOKEN: 'auth.id_token',
    REFRESH_TOKEN: 'auth.refresh_token',
    ACCESS_TOKEN: 'auth.access_token',
    TOKEN_TYPE: 'auth.token_type',

    // Security Challenges (PKCE)
    CHALLENGE: 'auth.challenge',
    STATE: 'auth.state',
} as const

/**
 * Saves a piece of text to the browser's storage.
 */
function save(key: string, value: string): void {
    try {
        localStorage.setItem(key, value)
    } catch (error) {
        console.error(`Could not save data to browser storage: ${key}`, error)
    }
}

/**
 * Retrieves a piece of text from the browser's storage.
 * Returns null if the item doesn't exist.
 */
function get(key: string): string | null {
    try {
        return localStorage.getItem(key)
    } catch (error) {
        console.error(`Could not read data from browser storage: ${key}`, error)
        return null
    }
}

/**
 * Deletes a specific piece of data from the browser's storage.
 */
function remove(key: string): void {
    try {
        localStorage.removeItem(key)
    } catch (error) {
        console.error(`Could not delete data from browser storage: ${key}`, error)
    }
}

/**
 * Clears ONLY the authentication-related data.
 * Useful for logging out without affecting other app settings.
 */
function clearAuth(): void {
    Object.values(StorageKeys).forEach(key => remove(key))
}

/**
 * Completely empties the browser's storage for this site.
 */
function clearAll(): void {
    try {
        localStorage.clear()
    } catch (error) {
        console.error('Could not clear browser storage', error)
    }
}

/**
 * Export a simple object to group these functions together.
 */
export const storage = {
    save,
    get,
    remove,
    clearAuth,
    clearAll
}
