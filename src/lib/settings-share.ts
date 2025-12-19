/**
 * Settings sharing utilities
 * Encode and decode settings to/from base64 for URL sharing
 */

import type { ShareableSettings, OAuthEndpoints } from '../types'

/**
 * Encode settings to base64 for sharing via URL
 */
export function encodeSettings(settings: ShareableSettings): string {
    try {
        const json = JSON.stringify(settings)
        // Use btoa for browser-safe base64 encoding
        return btoa(json)
    } catch (error) {
        console.error('Failed to encode settings:', error)
        throw new Error('Failed to encode settings for sharing')
    }
}

/**
 * Decode settings from base64 URL parameter
 */
export function decodeSettings(encoded: string): ShareableSettings | null {
    try {
        const json = atob(encoded)
        const settings = JSON.parse(json) as ShareableSettings

        // Validate the decoded settings
        if (!isValidSettings(settings)) {
            console.error('Invalid settings structure after decoding')
            return null
        }

        return settings
    } catch (error) {
        console.error('Failed to decode settings:', error)
        return null
    }
}

/**
 * Validate settings structure
 */
function isValidSettings(settings: any): settings is ShareableSettings {
    return (
        typeof settings === 'object' &&
        typeof settings.server === 'string' &&
        typeof settings.clientId === 'string' &&
        typeof settings.scope === 'string' &&
        typeof settings.endpoints === 'object' &&
        typeof settings.endpoints.authorization === 'string' &&
        typeof settings.endpoints.token === 'string' &&
        typeof settings.endpoints.userinfo === 'string' &&
        typeof settings.endpoints.logout === 'string'
    )
}

/**
 * Generate shareable URL with encoded settings
 */
export function generateShareableUrl(settings: ShareableSettings): string {
    const encoded = encodeSettings(settings)
    const url = new URL(window.location.origin)
    url.searchParams.set('settings', encoded)
    return url.toString()
}

/**
 * Read settings from current URL query string
 */
export function readSettingsFromUrl(): ShareableSettings | null {
    try {
        const params = new URLSearchParams(window.location.search)
        const encoded = params.get('settings')

        if (!encoded) {
            return null
        }

        return decodeSettings(encoded)
    } catch (error) {
        console.error('Failed to read settings from URL:', error)
        return null
    }
}

/**
 * Clear settings parameter from URL without page reload
 */
export function clearSettingsFromUrl(): void {
    try {
        const url = new URL(window.location.href)
        url.searchParams.delete('settings')
        window.history.replaceState({}, '', url.toString())
    } catch (error) {
        console.error('Failed to clear settings from URL:', error)
    }
}
