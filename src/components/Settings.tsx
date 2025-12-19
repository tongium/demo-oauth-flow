import { createSignal, onMount, Show } from 'solid-js'
import {
    getAuthClientID,
    getAuthScope,
    getAuthServer,
    getAuthEndpoints,
    setAuthClientID,
    setAuthScope,
    setAuthServer,
    setAuthEndpoints,
    useLogin,
    exportSettings,
    initializeFromUrl,
} from '../hooks/auth'
import { generateShareableUrl } from '../lib/settings-share'
import { getCallbackUrl, OAUTH_CONFIG } from '../config/oauth'
import type { OAuthEndpoints } from '../types'
import CopyTextInput from './CopyTextInput'
import TextInput from './TextInput'

export default () => {
    const [server, setServer] = createSignal(getAuthServer())
    const [clientID, setClientID] = createSignal(getAuthClientID())
    const [scope, setScope] = createSignal(getAuthScope())
    const [endpoints, setEndpoints] = createSignal(getAuthEndpoints())
    const [sidebarOpen, setSidebarOpen] = createSignal(false)
    const [shareUrl, setShareUrl] = createSignal<string | null>(null)

    // Initialize from URL on mount
    onMount(() => {
        const loaded = initializeFromUrl()
        if (loaded) {
            // Refresh signals if settings were loaded from URL
            setServer(getAuthServer())
            setClientID(getAuthClientID())
            setScope(getAuthScope())
            setEndpoints(getAuthEndpoints())
        }
    })

    /**
     * Normalize and update server URL
     */
    const updateServer = (value: string) => {
        const normalized = value.endsWith('/') ? value.slice(0, -1) : value
        setAuthServer(normalized)
        setServer(normalized)
    }

    const updateClientID = (value: string) => {
        setAuthClientID(value)
        setClientID(value)
    }

    const updateScope = (value: string) => {
        setAuthScope(value)
        setScope(value)
    }

    const updateEndpoint = (key: keyof OAuthEndpoints, value: string) => {
        const newEndpoints = { ...endpoints(), [key]: value }
        setEndpoints(newEndpoints)
        setAuthEndpoints(newEndpoints)
    }

    /**
     * Generate shareable URL with current settings
     */
    const handleShare = () => {
        try {
            const settings = exportSettings()
            const url = generateShareableUrl(settings)
            setShareUrl(url)
        } catch (error) {
            alert('Failed to generate share URL: ' + (error instanceof Error ? error.message : 'Unknown error'))
        }
    }

    return (
        <div class='relative flex items-center justify-center min-h-screen'>
            {/* Main Settings Card */}
            <div class='bg-gray-800 p-6 rounded-lg bg-opacity-50 shadow-xl max-w-lg w-full'>
                <div class='flex items-center justify-between mb-4'>
                    <h1 class='text-2xl font-bold text-white'>OAuth 2.0 Demo</h1>
                    <div class='flex items-center gap-2'>
                        <a
                            href='https://github.com/tongium/demo-oauth-flow'
                            class='p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-sm transition'
                            target='_blank'
                            title='View source on GitHub'
                        >
                            <svg class='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                                <path fill-rule='evenodd' d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' clip-rule='evenodd' />
                            </svg>
                        </a>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            class='p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-sm transition'
                            title='Advanced Settings'
                        >
                            <svg class='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path
                                    stroke-linecap='round'
                                    stroke-linejoin='round'
                                    stroke-width='2'
                                    d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                                />
                                <path
                                    stroke-linecap='round'
                                    stroke-linejoin='round'
                                    stroke-width='2'
                                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <p class='text-gray-300 mb-6 text-sm text-center'>
                    Demo the{' '}
                    <a
                        class='text-green-400 font-semibold hover:text-green-300 underline'
                        target='_blank'
                        href='https://www.oauth.com/oauth2-servers/pkce/authorization-code-exchange/'
                    >
                        OAuth 2.0 PKCE flow
                    </a>
                    {' '}with any authorization server.
                </p>

                {/* Main Settings - Frequently Changed */}
                <div class='space-y-4'>
                    <TextInput id='auth-server' value={server()} label='OAuth Server URL' onUpdate={updateServer} />
                    <TextInput id='client-id' value={clientID()} label='Client ID' onUpdate={updateClientID} />
                </div>

                {/* Callback URL */}
                <div class='mt-6'>
                    <CopyTextInput value={getCallbackUrl()} label='Callback URL' id='callback-url' />
                    <p class='text-xs text-gray-400 mt-1'>Use this URL in your OAuth app configuration</p>
                </div>

                {/* Action Buttons */}
                <div class='mt-6 space-y-3'>
                    <button
                        class='w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-200 ease-in-out'
                        onClick={useLogin}
                    >
                        Start OAuth Flow →
                    </button>

                    <button
                        class='w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 ease-in-out'
                        onClick={handleShare}
                    >
                        📋 Share Configuration
                    </button>
                </div>

                {/* Share URL Display */}
                <Show when={shareUrl()}>
                    <div class='mt-4 p-3 bg-green-900 bg-opacity-20 border border-green-600 rounded-sm'>
                        <div class='flex items-center justify-between mb-2'>
                            <p class='text-xs text-green-400 font-semibold'>✓ Share URL Generated</p>
                            <button
                                class='text-sm text-green-400 hover:text-green-300'
                                onClick={() => setShareUrl(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <CopyTextInput value={shareUrl()!} label='' id='share-url' />
                        <p class='text-xs text-gray-400 mt-2'>Anyone with this URL will load your exact configuration</p>
                    </div>
                </Show>
            </div>

            {/* Sidebar - Advanced Settings */}
            <Show when={sidebarOpen()}>
                <div
                    class='fixed inset-0 bg-black bg-opacity-50 z-40'
                    onClick={() => setSidebarOpen(false)}
                />
                <div class='fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-800 shadow-2xl z-50 overflow-y-auto'>
                    <div class='sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between'>
                        <h2 class='text-xl font-bold text-white'>Advanced Settings</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            class='p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-sm transition'
                        >
                            <svg class='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </button>
                    </div>

                    <div class='p-4 space-y-6'>
                        {/* OAuth Scope */}
                        <section>
                            <h3 class='text-sm font-semibold text-gray-300 mb-3 flex items-center'>
                                <span class='w-2 h-2 bg-green-400 rounded-full mr-2' />
                                OAuth Scope
                            </h3>
                            <TextInput id='scope' value={scope()} label='Scope' onUpdate={updateScope} />
                            <p class='text-xs text-gray-400 mt-2'>
                                Space-separated OAuth scopes (e.g., "openid profile email")
                            </p>
                        </section>

                        {/* Custom Endpoints */}
                        <section>
                            <h3 class='text-sm font-semibold text-gray-300 mb-3 flex items-center'>
                                <span class='w-2 h-2 bg-blue-400 rounded-full mr-2' />
                                Custom Endpoints
                            </h3>
                            <p class='text-xs text-gray-400 mb-3'>
                                Override default OAuth2 endpoint paths. Leave as default unless your server uses different paths.
                            </p>
                            <div class='space-y-3'>
                                <TextInput
                                    id='endpoint-auth'
                                    value={endpoints().authorization}
                                    label='Authorization Endpoint'
                                    onUpdate={(v) => updateEndpoint('authorization', v)}
                                />
                                <TextInput
                                    id='endpoint-token'
                                    value={endpoints().token}
                                    label='Token Endpoint'
                                    onUpdate={(v) => updateEndpoint('token', v)}
                                />
                                <TextInput
                                    id='endpoint-userinfo'
                                    value={endpoints().userinfo}
                                    label='Userinfo Endpoint'
                                    onUpdate={(v) => updateEndpoint('userinfo', v)}
                                />
                                <TextInput
                                    id='endpoint-logout'
                                    value={endpoints().logout}
                                    label='Logout Endpoint'
                                    onUpdate={(v) => updateEndpoint('logout', v)}
                                />
                            </div>
                        </section>

                        {/* Computed URLs Preview */}
                        <section>
                            <h3 class='text-sm font-semibold text-gray-300 mb-3 flex items-center'>
                                <span class='w-2 h-2 bg-purple-400 rounded-full mr-2' />
                                Computed URLs
                            </h3>
                            <div class='space-y-2'>
                                <CopyTextInput
                                    value={server() + endpoints().authorization}
                                    label='Authorization URL'
                                    id='sidebar-auth-url'
                                />
                                <CopyTextInput
                                    value={server() + endpoints().token}
                                    label='Token URL'
                                    id='sidebar-token-url'
                                />
                                <CopyTextInput
                                    value={server() + endpoints().userinfo}
                                    label='Userinfo URL'
                                    id='sidebar-userinfo-url'
                                />
                                <CopyTextInput
                                    value={server() + endpoints().logout}
                                    label='Logout URL'
                                    id='sidebar-logout-url'
                                />
                            </div>
                        </section>

                        {/* Reset to Defaults */}
                        <section class='pt-4 border-t border-gray-700'>
                            <button
                                class='w-full py-2 bg-red-900 bg-opacity-30 hover:bg-opacity-50 text-red-400 font-medium rounded-sm border border-red-600 transition duration-200'
                                onClick={() => {
                                    if (confirm('Reset all settings to default configuration?')) {
                                        // Reset to default config values
                                        const defaultServer = OAUTH_CONFIG.DEFAULT_SERVER
                                        const defaultClientID = OAUTH_CONFIG.DEFAULT_CLIENT_ID
                                        const defaultScope = OAUTH_CONFIG.DEFAULT_SCOPE
                                        const defaultEndpoints: OAuthEndpoints = {
                                            authorization: OAUTH_CONFIG.ENDPOINTS.AUTHORIZATION,
                                            token: OAUTH_CONFIG.ENDPOINTS.TOKEN,
                                            userinfo: OAUTH_CONFIG.ENDPOINTS.USERINFO,
                                            logout: OAUTH_CONFIG.ENDPOINTS.LOGOUT,
                                        }

                                        // Update state
                                        setServer(defaultServer)
                                        setClientID(defaultClientID)
                                        setScope(defaultScope)
                                        setEndpoints(defaultEndpoints)

                                        // Save to storage
                                        setAuthServer(defaultServer)
                                        setAuthClientID(defaultClientID)
                                        setAuthScope(defaultScope)
                                        setAuthEndpoints(defaultEndpoints)
                                    }
                                }}
                            >
                                Reset to Defaults
                            </button>
                        </section>
                    </div>
                </div>
            </Show>
        </div>
    )
}