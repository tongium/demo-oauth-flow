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
    performLogin,
    exportSettings,
    initializeSettingsFromUrl,
    fetchDefaultEndpoints,
} from '../hooks/auth'
import { generateShareableUrl } from '../lib/settings-share'
import { getRedirectUrl, getPostLogoutRedirectURL, OAUTH_CONFIG } from '../config/oauth'
import type { OAuthEndpoints } from '../types'
import CopyTextInput from './CopyTextInput'
import TextInput from './TextInput'

/**
 * Minimalist Settings Component
 * 
 * Features a soft-card design with a deep zinc palette.
 * Focuses on clarity and reduced visual noise.
 */
export default function Settings() {
    const [server, setServer] = createSignal(getAuthServer())
    const [clientID, setClientID] = createSignal(getAuthClientID())
    const [scope, setScope] = createSignal(getAuthScope())
    const [endpoints, setEndpoints] = createSignal(getAuthEndpoints())
    
    const [sidebarOpen, setSidebarOpen] = createSignal(false)
    const [shareUrl, setShareUrl] = createSignal<string | null>(null)

    onMount(() => {
        const loaded = initializeSettingsFromUrl()
        if (loaded) {
            setServer(getAuthServer())
            setClientID(getAuthClientID())
            setScope(getAuthScope())
            setEndpoints(getAuthEndpoints())
        }
    })

    const updateServer = async (value: string) => {
        const normalized = value.endsWith('/') ? value.slice(0, -1) : value
        setAuthServer(normalized)
        setServer(normalized)

        try {
            const newEndpoints = await fetchDefaultEndpoints(normalized)
            setEndpoints(newEndpoints)
            setAuthEndpoints(newEndpoints)
        } catch (e) {
            console.warn('Could not auto-fetch endpoints.')
        }
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

    const handleShare = () => {
        try {
            const settings = exportSettings()
            const url = generateShareableUrl(settings)
            setShareUrl(url)
        } catch (error) {
            console.error('Failed to generate share URL', error)
        }
    }

    return (
        <div class='w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700'>
            {/* Soft Card Container */}
            <div class='bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-8 shadow-2xl backdrop-blur-sm'>
                <header class='flex items-center justify-between mb-8'>
                    <div>
                        <h1 class='text-xl font-semibold text-zinc-100 tracking-tight'>OAuth 2.0 Demo</h1>
                        <p class='text-[13px] text-zinc-500 mt-0.5'>Test PKCE flow with any server.</p>
                    </div>
                    <div class='flex items-center gap-1'>
                        <a
                            href='https://github.com/tongium/demo-oauth-flow'
                            class='p-2 text-zinc-500 hover:text-zinc-200 transition-colors'
                            target='_blank'
                            title='GitHub'
                        >
                            <svg class='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                                <path fill-rule='evenodd' d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' clip-rule='evenodd' />
                            </svg>
                        </a>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            class='p-2 text-zinc-500 hover:text-zinc-200 transition-colors'
                            title='Settings'
                        >
                            <svg class='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                            </svg>
                        </button>
                    </div>
                </header>

                <div class='space-y-5'>
                    <TextInput id='auth-server' value={server()} label='Authorization Server' onUpdate={updateServer} />
                    <TextInput id='client-id' value={clientID()} label='Client ID' onUpdate={updateClientID} />
                    
                    <div class='pt-2 space-y-3'>
                        <CopyTextInput value={getRedirectUrl()} label='Login Callback' id='callback-url' />
                        <CopyTextInput value={getPostLogoutRedirectURL()} label='Logout Callback' id='logout-url' />
                    </div>
                </div>

                <div class='mt-10 flex gap-2'>
                    <button
                        class='px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-zinc-700/50'
                        onClick={handleShare}
                        title="Share URL"
                    >
                        Share
                    </button>
                    <button
                        class='flex-1 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-lg shadow-lg transform active:scale-[0.98] transition-all text-sm uppercase tracking-wide'
                        onClick={performLogin}
                    >
                        Start Login Flow
                    </button>
                </div>

                <Show when={shareUrl()}>
                    <div class='mt-6 pt-6 border-t border-zinc-800/50 animate-in fade-in slide-in-from-top-2'>
                        <CopyTextInput value={shareUrl()!} label='Shareable link created' id='share-url' />
                    </div>
                </Show>
            </div>

            {/* Advanced Settings Sidebar */}
            <Show when={sidebarOpen()}>
                <div class='fixed inset-0 bg-black/60 backdrop-blur-sm z-40' onClick={() => setSidebarOpen(false)} />
                <div class='fixed right-0 top-0 bottom-0 w-full max-w-sm bg-zinc-900 shadow-2xl z-50 overflow-y-auto border-l border-zinc-800 animate-in slide-in-from-right duration-300'>
                    <div class='p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 sticky top-0 backdrop-blur-md'>
                        <h2 class='text-lg font-semibold text-zinc-100'>Advanced Settings</h2>
                        <button onClick={() => setSidebarOpen(false)} class='text-zinc-500 hover:text-zinc-200 transition-colors'>✕</button>
                    </div>

                    <div class='p-6 space-y-8 pb-12'>
                        <section>
                            <h3 class='text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4'>Permissions</h3>
                            <TextInput id='scope' value={scope()} label='Scopes' onUpdate={updateScope} />
                        </section>

                        <section>
                            <h3 class='text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4'>API Endpoints</h3>
                            <div class='space-y-4'>
                                <TextInput id='e-auth' value={endpoints().authorization} label='Authorization' onUpdate={v => updateEndpoint('authorization', v)} />
                                <TextInput id='e-token' value={endpoints().token} label='Token Exchange' onUpdate={v => updateEndpoint('token', v)} />
                                <TextInput id='e-user' value={endpoints().userinfo} label='User Profile' onUpdate={v => updateEndpoint('userinfo', v)} />
                                <TextInput id='e-logout' value={endpoints().logout} label='Logout' onUpdate={v => updateEndpoint('logout', v)} />
                                <TextInput id='e-revoke' value={endpoints().revoke} label='Revoke Token' onUpdate={v => updateEndpoint('revoke', v)} />
                            </div>
                        </section>

                        <section class='pt-8 border-t border-zinc-800'>
                            <button
                                class='w-full py-2.5 bg-zinc-950 hover:bg-red-950/20 text-zinc-600 hover:text-red-500 border border-zinc-800 hover:border-red-900/50 rounded transition-all text-xs font-bold'
                                onClick={async () => {
                                    if (confirm('Reset to defaults?')) {
                                        const dServer = OAUTH_CONFIG.DEFAULT_SERVER
                                        const dClientID = OAUTH_CONFIG.DEFAULT_CLIENT_ID
                                        const dScope = OAUTH_CONFIG.DEFAULT_SCOPE
                                        const dEndpoints = await fetchDefaultEndpoints(dServer)

                                        setServer(dServer); setAuthServer(dServer)
                                        setClientID(dClientID); setAuthClientID(dClientID)
                                        setScope(dScope); setAuthScope(dScope)
                                        setEndpoints(dEndpoints); setAuthEndpoints(dEndpoints)
                                    }
                                }}
                            >
                                RESET TO DEFAULTS
                            </button>
                        </section>
                    </div>
                </div>
            </Show>
        </div>
    )
}
