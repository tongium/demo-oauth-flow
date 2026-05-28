/**
 * Settings Sharing System
 * 
 * This file allows users to share their OAuth configuration with others
 * by encoding the settings into a URL. When someone clicks the link,
 * the app reads the URL and automatically fills in the settings.
 */

import type { ShareableSettings, OAuthEndpoints } from '../types'

/**
 * Converts a settings object into a scrambled "base64" string.
 * This makes it safe to put into a URL.
 */
export function encodeSettings(settings: ShareableSettings): string {
    try {
        const json = JSON.stringify(settings)
        // btoa() is a built-in browser function that turns text into base64
        return btoa(json)
    } catch (error) {
        console.error('Failed to encode settings:', error)
        throw new Error('Failed to prepare settings for sharing')
    }
}

/**
 * Turns a "base64" string from a URL back into a readable settings object.
 */
export function decodeSettings(encoded: string): ShareableSettings | null {
    try {
        // atob() is the opposite of btoa() - it decodes base64 back to text
        const json = atob(encoded)
        const settings = JSON.parse(json) as ShareableSettings

        // Make sure the data we decoded is actually what we expect
        if (!isValidSettings(settings)) {
            console.error('The shared settings link seems to be broken.')
            return null
        }

        // Backward compatibility: Some servers use relative paths for endpoints.
        // We ensure they are full URLs by prepending the server URL.
        if (settings.endpoints) {
            const { server, endpoints } = settings
            for (const key in endpoints) {
                const val = endpoints[key as keyof OAuthEndpoints]
                if (val && val.startsWith('/')) {
                    endpoints[key as keyof OAuthEndpoints] = server + val
                }
            }
        }

        return settings
    } catch (error) {
        console.error('Failed to decode settings:', error)
        return null
    }
}

/**
 * Checks if the object has all the required fields for a configuration.
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
 * Creates a full URL (including the current site's address) with the 
 * settings packed inside a "settings" parameter.
 */
export function generateShareableUrl(settings: ShareableSettings): string {
    const encoded = encodeSettings(settings)
    const url = new URL(window.location.origin)
    url.searchParams.set('settings', encoded)
    return url.toString()
}

/**
 * Looks at the browser's current URL to see if it contains shared settings.
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
        console.error('Could not read settings from the URL:', error)
        return null
    }
}

/**
 * Removes the settings from the browser's address bar after they've been
 * loaded, so the URL looks "clean" again.
 */
export function clearSettingsFromUrl(): void {
    try {
        const url = new URL(window.location.href)
        url.searchParams.delete('settings')
        window.history.replaceState({}, '', url.toString())
    } catch (error) {
        console.error('Could not clean up the URL:', error)
    }
}
