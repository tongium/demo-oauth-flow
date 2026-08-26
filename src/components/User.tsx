import jwt_decode from 'jwt-decode'
import { createEffect, createMemo, createSignal, Show, For } from 'solid-js'
import { 
    getAccessToken, 
    getIDToken, 
    performLogout, 
    getRefreshToken, 
    refreshAccessToken, 
    fetchUserInfo, 
    getAuthEndpoints 
} from '../hooks/auth'
import { getErrorMessage } from '../lib/errors'
import type { IdTokenPayload } from '../types'
import CopyTextInput from './CopyTextInput'
import JsonViewer from './JsonViewer'

/**
 * Smart Token Visualizer
 * Automatically detects JWT format and provides color-coded visualization.
 * Falls back to a clean mono display for opaque tokens.
 */
function TokenDisplay(props: { token: string | null; label: string }) {
    const [isExpanded, setIsExpanded] = createSignal(false)
    const [justCopied, setJustCopied] = createSignal(false)
    
    const isJwt = createMemo(() => {
        if (!props.token) return false
        return props.token.split('.').length === 3
    })
    
    const copy = (e: MouseEvent) => {
        e.stopPropagation()
        if (!props.token) return
        navigator.clipboard.writeText(props.token)
        setJustCopied(true)
        setTimeout(() => setJustCopied(false), 2000)
    }

    const CopyButton = () => (
        <button 
            data-testid={`copy-token-${props.label.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={copy} 
            class={`absolute top-2 right-2 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${justCopied() ? 'text-emerald-400 opacity-100' : 'text-zinc-500 opacity-0 group-hover/box:opacity-100 hover:text-zinc-200'}`}
        >
            {justCopied() ? 'Copied' : 'Copy'}
        </button>
    )

    return (
        <div class="flex flex-col gap-1.5">
            <Show 
                when={props.token} 
                fallback={
                    <div class="flex flex-col gap-1.5 opacity-50">
                        <label class='text-[13px] font-medium text-zinc-400'>{props.label}</label>
                        <div class="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-600 font-mono text-[12px]">
                            No token available
                        </div>
                    </div>
                }
            >
                <div class="flex items-center gap-3">
                    <label class='text-[13px] font-medium text-zinc-400'>{props.label}</label>
                    <Show when={isJwt()}>
                        <button 
                            data-testid={`toggle-token-structure-${props.label.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => setIsExpanded(!isExpanded())}
                            class="text-[10px] text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
                        >
                            {isExpanded() ? 'Hide structure' : 'Show structure'}
                        </button>
                    </Show>
                </div>
                
                <div class="relative group/box">
                    <Show 
                        when={isExpanded() && isJwt()} 
                        fallback={
                            <div 
                                data-testid={`token-panel-${props.label.toLowerCase().replace(/\s+/g, '-')}`}
                                class={`bg-zinc-900 border border-zinc-800 rounded px-3 py-2 transition-colors ${isJwt() ? 'cursor-pointer hover:border-zinc-700' : 'cursor-default'}`}
                                onClick={() => isJwt() && setIsExpanded(true)}
                            >
                                <code class="text-[12px] text-zinc-500 font-mono truncate block w-full pr-12">
                                    {props.token}
                                </code>
                            </div>
                        }
                    >
                        <div class="animate-in fade-in zoom-in-95 duration-200">
                            <div class="bg-zinc-900 border border-zinc-800 rounded p-3 font-mono text-[12px] break-all leading-relaxed cursor-default pr-12">
                                <span class="text-red-400/80">{props.token!.split('.')[0]}</span>
                                <span class="text-zinc-600">.</span>
                                <span class="text-emerald-400/80">{props.token!.split('.')[1]}</span>
                                <span class="text-zinc-600">.</span>
                                <span class="text-blue-400/80">{props.token!.split('.')[2]}</span>
                            </div>
                            <div class="flex gap-4 mt-2">
                                <div class="flex items-center gap-1.5">
                                    <div class="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                                    <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">Header</span>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                                    <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">Payload</span>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <div class="w-1.5 h-1.5 rounded-full bg-blue-400/80" />
                                    <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">Signature</span>
                                </div>
                            </div>
                        </div>
                    </Show>
                    <CopyButton />
                </div>
            </Show>
        </div>
    )
}
/**
 * Minimalist User Profile Component
 * 
 * Features a single vertical flow with subtle dividers and a clean tech aesthetic.
 */
export default function User() {
    const [accessToken, setAccessToken] = createSignal<string | null>(null)
    const [idToken, setIdToken] = createSignal<string | null>(null)
    const [refreshToken, setRefreshToken] = createSignal<string | null>(null)
    const [userinfoJson, setUserinfoJson] = createSignal<string>('{}')
    const [subject, setSubject] = createSignal<string>('')
    const [loading, setLoading] = createSignal(false)
    const [error, setError] = createSignal<string | null>(null)
    const [showRawJson, setShowRawJson] = createSignal(false)
    const [showFullCurl, setShowFullCurl] = createSignal(false)
    const [curlCopied, setCurlCopied] = createSignal(false)

    const updateProfile = async () => {
        try {
            setLoading(true)
            setError(null)
            const info = await fetchUserInfo()
            setUserinfoJson(JSON.stringify(info, null, 4))
        } catch (err) {
            const message = getErrorMessage(err)
            setError(`Failed to fetch user info: ${message}`)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    createEffect(() => {
        setAccessToken(getAccessToken())
        setIdToken(getIDToken())
        setRefreshToken(getRefreshToken())

        try {
            const token = idToken()
            if (token) {
                const payload = jwt_decode<IdTokenPayload>(token)
                if (payload.sub) setSubject(payload.sub)
            }
        } catch (err) {
            console.error('Failed to decode ID token:', err)
        }

        updateProfile()
    })

    const handleRefresh = async () => {
        try {
            setLoading(true)
            setError(null)
            await refreshAccessToken()
            setAccessToken(getAccessToken())
            setIdToken(getIDToken())
            setRefreshToken(getRefreshToken())
            const token = getIDToken()
            if (token) {
                const payload = jwt_decode<IdTokenPayload>(token)
                setSubject(payload.sub || '')
            } else {
                setSubject('')
            }
            await updateProfile()
        } catch (err) {
            const message = getErrorMessage(err)
            setError(`Failed to refresh token: ${message}`)
        } finally {
            setLoading(false)
        }
    }

    const idTokenPayload = createMemo(() => {
        try {
            const token = idToken()
            return token ? jwt_decode<IdTokenPayload>(token) : null
        } catch {
            return null
        }
    })

    const formatTimestamp = (ts?: number) => {
        if (!ts) return '—'
        return new Date(ts * 1000).toLocaleString()
    }

    const curlCommand = createMemo(() => {
        const token = accessToken() || '<access_token>'
        const url = getAuthEndpoints().userinfo
        return `curl -s -H "Authorization: Bearer ${token}" "${url}"`
    })

    const displayUserinfo = createMemo(() => {
        try {
            const info = JSON.parse(userinfoJson())
            // If profile data is empty, show the decoded ID token claims instead
            if (Object.keys(info).length === 0 && idTokenPayload()) {
                return idTokenPayload()
            }
            return info
        } catch (err) {
            console.error('Failed to parse userinfo JSON:', err)
            return idTokenPayload() || {}
        }
    })

    return (
        <div class='w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20'>
            {/* Header Section */}
            <header class='flex items-end justify-between mb-12'>
                <div>
                    <h2 class='text-2xl font-semibold text-zinc-100 tracking-tight'>Session Profile</h2>
                    <p class='text-[13px] text-zinc-500 mt-1'>Authenticated as <span class="text-zinc-300 font-mono">{subject()}</span></p>
                </div>
                <button
                    data-testid='end-session'
                    class='text-[11px] font-bold text-zinc-500 hover:text-red-400 uppercase tracking-widest transition-colors'
                    onClick={performLogout}
                >
                    End Session
                </button>
            </header>

            {error() && (
                <div class='mb-8 p-4 bg-red-950/20 border border-red-900/50 rounded-lg text-red-400 text-sm'>
                    {error()}
                </div>
            )}

            <div class='space-y-12'>
                {/* Section 1: Identity */}
                <section>
                    <div class="flex items-center gap-4 mb-6">
                        <h3 class='text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap'>Identity Claims</h3>
                        <div class="h-[1px] w-full bg-zinc-800/50" />
                    </div>
                    <div class='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
                        <CopyTextInput value={subject()} label='Subject' id='subject' />
                        <CopyTextInput value={idTokenPayload()?.iss || ''} label='Issuer' id='issuer' />
                        <CopyTextInput value={formatTimestamp(idTokenPayload()?.exp)} label='Expires' id='exp' />
                        <CopyTextInput value={formatTimestamp(idTokenPayload()?.iat)} label='Issued' id='iat' />
                    </div>
                </section>

                {/* Section 2: Tokens */}
                <section>
                    <div class="flex items-center gap-4 mb-6">
                        <h3 class='text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap'>Security Tokens</h3>
                        <div class="h-[1px] w-full bg-zinc-800/50" />
                        <button
                            data-testid='user-refresh-tokens'
                            class='text-[10px] font-bold text-zinc-400 hover:text-zinc-100 uppercase tracking-widest transition-colors whitespace-nowrap'
                            onClick={handleRefresh}
                            disabled={loading()}
                        >
                            {loading() ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                    <div class='space-y-6'>
                        <TokenDisplay token={accessToken()} label='Access Token' />
                        <TokenDisplay token={idToken()} label='ID Token' />
                        <TokenDisplay token={refreshToken()} label='Refresh Token' />
                    </div>
                </section>

                {/* Section 3: Profile Data */}
                <section>
                    <div class="flex items-center gap-4 mb-6">
                        <h3 class='text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap'>Profile Data</h3>
                        <div class="h-[1px] w-full bg-zinc-800/50" />
                        <button
                            data-testid='user-open-raw-json'
                            class='text-[10px] font-bold text-zinc-400 hover:text-zinc-100 uppercase tracking-widest transition-colors whitespace-nowrap'
                            onClick={() => setShowRawJson(true)}
                        >
                            Raw JSON
                        </button>
                    </div>
                    
                    <div class='bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/50 backdrop-blur-sm'>
                        <JsonViewer data={displayUserinfo()} />
                        <Show when={userinfoJson() === '{}'}>
                            <p class='text-[10px] text-zinc-600 mt-4 text-center uppercase tracking-widest'>Showing ID Token claims (Profile API returned empty)</p>
                        </Show>
                    </div>

                    <div class='mt-8 space-y-3'>
                        <div class="flex items-center justify-between">
                            <h4 class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Terminal Request</h4>
                            <button 
                                data-testid='user-toggle-full-curl'
                                onClick={() => setShowFullCurl(!showFullCurl())}
                                class="text-[10px] text-zinc-400 hover:text-zinc-200 underline underline-offset-4"
                            >
                                {showFullCurl() ? 'Hide full command' : 'Show full command'}
                            </button>
                        </div>
                        
                        <Show 
                            when={showFullCurl()} 
                            fallback={
                                <div class="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 flex items-center justify-between group">
                                    <code class="text-[12px] text-zinc-400 font-mono truncate mr-4">
                                        curl -s -H "Authorization: Bearer {accessToken()?.slice(0, 10)}..." "{getAuthEndpoints().userinfo}"
                                    </code>
                                    <button 
                                        data-testid='user-copy-curl-command'
                                        onClick={() => {
                                            navigator.clipboard.writeText(curlCommand())
                                            setCurlCopied(true)
                                            setTimeout(() => setCurlCopied(false), 2000)
                                        }}
                                        class={`text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${curlCopied() ? 'text-emerald-400 scale-110' : 'text-zinc-500 group-hover:text-zinc-200'}`}
                                    >
                                        {curlCopied() ? '✓ Copied' : 'Copy'}
                                    </button>
                                </div>
                            }
                        >
                            <CopyTextInput value={curlCommand()} label='' id='curl-example' multiline={true} />
                        </Show>
                    </div>
                </section>
            </div>

            {/* Simple Modal */}
            <Show when={showRawJson()}>
                <div class='fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6' onClick={() => setShowRawJson(false)}>
                    <div class='bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300' onClick={e => e.stopPropagation()}>
                        <div class='p-6 border-b border-zinc-800 flex justify-between items-center'>
                            <h3 class='text-sm font-bold text-zinc-100 uppercase tracking-widest'>Raw Profile JSON</h3>
                            <button data-testid='user-close-raw-json' onClick={() => setShowRawJson(false)} class='text-zinc-500 hover:text-zinc-100'>✕</button>
                        </div>
                        <div class='p-6 overflow-auto font-mono text-[13px] text-zinc-400 leading-relaxed'>
                            <pre>{userinfoJson()}</pre>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    )
}
