import jwt_decode from 'jwt-decode'
import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import { useAccessToken, useIDToken, useLogout, useReadRefreshToken, useRefreshToken, useUserInfo, getAuthServer, getAuthEndpoints } from '../hooks/auth'
import { getErrorMessage } from '../lib/errors'
import type { IdTokenPayload, UserInfo } from '../types'
import CopyTextInput from './CopyTextInput'

const [accessToken, setAccessToken] = createSignal<string | null>(null)
const [refreshToken, setRefreshToken] = createSignal<string | null>(null)
const [userinfo, setUserinfo] = createSignal<string>('{}')
const [subject, setSubject] = createSignal<string>('')
const [loading, setLoading] = createSignal(false)
const [error, setError] = createSignal<string | null>(null)

/**
 * Update user info from server
 */
const updateUserinfo = async () => {
    try {
        setLoading(true)
        setError(null)
        const info = await useUserInfo()
        setUserinfo(JSON.stringify(info, null, 4))
    } catch (err) {
        const message = getErrorMessage(err)
        setError(`Failed to fetch user info: ${message}`)
        console.error(err)
    } finally {
        setLoading(false)
    }
}

/**
 * Initialize component with user data
 */
createEffect(() => {
    // Get and set tokens
    setAccessToken(useAccessToken())
    setRefreshToken(useReadRefreshToken())

    // Decode ID token and extract subject
    try {
        const token = useIDToken()
        if (token) {
            const payload = jwt_decode<IdTokenPayload>(token)
            if (payload.sub) {
                setSubject(payload.sub)
            }
        }
    } catch (err) {
        console.error('Failed to decode ID token:', err)
    }

    // Fetch user info
    updateUserinfo()
})

/**
 * Handle token refresh
 */
const refresh = async () => {
    try {
        setLoading(true)
        setError(null)
        await useRefreshToken()

        // Update displayed tokens
        setAccessToken(useAccessToken())
        setRefreshToken(useReadRefreshToken())

        // Refresh user info
        await updateUserinfo()
    } catch (err) {
        const message = getErrorMessage(err)
        setError(`Failed to refresh token: ${message}`)
        console.error(err)
    } finally {
        setLoading(false)
    }
}

export default () => {
    // Parse userinfo JSON once for display
    const parsedUserinfo = createMemo(() => {
        try {
            return JSON.parse(userinfo()) as Record<string, unknown>
        } catch {
            return null
        }
    })

    // Decode ID token payload for identity summary
    const idPayload = createMemo(() => {
        try {
            const token = useIDToken()
            return token ? jwt_decode<IdTokenPayload>(token) : null
        } catch {
            return null
        }
    })

    const formatTime = (ts?: number) => {
        if (!ts) return '—'
        const d = new Date(ts * 1000)
        return `${d.toLocaleString()}`
    }

    const isExpired = createMemo(() => {
        const exp = idPayload()?.exp
        return exp ? exp * 1000 <= Date.now() : false
    })

    // Toggle for showing raw userinfo JSON modal
    const [showUserinfoModal, setShowUserinfoModal] = createSignal(false)

    // Build userinfo URL and example curl command
    const userinfoUrl = createMemo(() => `${getAuthServer()}${getAuthEndpoints().userinfo}`)
    const curlExample = createMemo(() => {
        const token = accessToken() || '<access_token>'
        return `curl -s -H "Authorization: Bearer ${token}" "${userinfoUrl()}"`
    })

    // Lightweight recursive JSON viewer
    const JsonViewer = (props: { data: unknown; depth?: number }) => {
        const depth = props.depth ?? 0
        const padClass = `pl-${Math.min(depth * 4, 12)}` // cap indentation

        if (props.data === null) {
            return <span class='text-gray-400'>null</span>
        }

        const t = typeof props.data
        if (t === 'string') return <span class='text-green-300'>"{props.data as string}"</span>
        if (t === 'number') return <span class='text-blue-300'>{props.data as number}</span>
        if (t === 'boolean') return <span class='text-purple-300'>{(props.data as boolean) ? 'true' : 'false'}</span>

        if (Array.isArray(props.data)) {
            return (
                <div class={`${padClass}`}>
                    <span class='text-gray-300'>[</span>
                    <div class='pl-4 space-y-1'>
                        {(props.data as unknown[]).map((item) => (
                            <div><JsonViewer data={item} depth={(depth + 1)} /></div>
                        ))}
                    </div>
                    <span class='text-gray-300'>]</span>
                </div>
            )
        }

        // Object
        const obj = props.data as Record<string, unknown>
        return (
            <div class={`${padClass}`}>
                <span class='text-gray-300'>{'{'}</span>
                <div class='pl-4 space-y-1'>
                    {Object.keys(obj).map((key) => (
                        <div class='flex'>
                            <span class='text-emerald-300'>"{key}"</span>
                            <span class='text-gray-400 mx-1'>:</span>
                            <JsonViewer data={obj[key]} depth={(depth + 1)} />
                        </div>
                    ))}
                </div>
                <span class='text-gray-300'>{'}'}</span>
            </div>
        )
    }

    return (
        <div class='bg-gray-800 p-4 bg-opacity-50 rounded-lg shadow-xl max-w-3xl w-full space-y-6'>
            {/* Header */}
            <div>
                <h2 class='text-xl font-bold text-white'>Account Overview</h2>
                <p class='text-sm text-gray-300'>Authenticated session details, tokens, and user claims.</p>
            </div>

            {error() && (
                <div class='bg-red-900 bg-opacity-50 border border-red-600 text-red-200 px-4 py-3 rounded-sm mb-4'>
                    {error()}
                </div>
            )}

            {/* Identity Summary */}
            <div class='rounded-sm bg-gray-900 border border-gray-700 p-3'>
                <div class='flex items-center justify-between'>
                    <h3 class='text-sm font-semibold text-gray-200'>Identity</h3>
                    <div class='flex items-center gap-2'>
                        <button
                            class='text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded-sm border border-gray-600'
                            onClick={() => setShowUserinfoModal(true)}
                        >
                            Show Raw JSON
                        </button>
                        <button
                            id='logout-btn'
                            class='text-xs bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold px-3 py-1 rounded-sm transition duration-200'
                            onClick={useLogout}
                            disabled={loading()}
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <div class='mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <div>
                        <CopyTextInput value={subject()} label='Subject (sub)' id='subject' />
                        <p class='text-xs text-gray-400 mt-1'>Unique user identifier from the ID token.</p>
                    </div>
                    <div>
                        <CopyTextInput value={idPayload()?.iss || ''} label='Issuer (iss)' id='issuer' />
                        <p class='text-xs text-gray-400 mt-1'>Authorization server that issued the ID token.</p>
                    </div>
                    <div>
                        <CopyTextInput value={formatTime(idPayload()?.exp)} label='Expires (exp)' id='exp' />
                        <p class='text-xs text-gray-400 mt-1'>When the ID token expires.</p>
                    </div>
                    <div>
                        <CopyTextInput value={formatTime(idPayload()?.iat)} label='Issued At (iat)' id='iat' />
                        <p class='text-xs text-gray-400 mt-1'>When the ID token was issued.</p>
                    </div>
                </div>
            </div>

            {/* Tokens */}
            <div class='rounded-sm bg-gray-900 border border-gray-700 p-3 space-y-3'>
                <div class='flex items-center justify-between'>
                    <h3 class='text-sm font-semibold text-gray-200'>Tokens</h3>
                    <button
                        id='refresh-btn'
                        class='text-xs bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold px-3 py-1 rounded-sm transition duration-200'
                        onClick={refresh}
                        disabled={loading()}
                    >
                        {loading() ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
                <div>
                    <CopyTextInput value={accessToken() || ''} label='Access Token' id='access-token' />
                    <p class='text-xs text-gray-400 mt-1'>Bearer token used to access protected APIs via the Authorization header.</p>
                </div>
                <div>
                    <CopyTextInput value={refreshToken() || ''} label='Refresh Token' id='refresh-token' />
                    <p class='text-xs text-gray-400 mt-1'>Used to obtain new access tokens without re-authenticating. Keep it secret.</p>
                </div>
                <div>
                    <CopyTextInput value={useIDToken() || ''} label='ID Token' id='id-token' />
                    <p class='text-xs text-gray-400 mt-1'>JWT containing identity claims about the user (not for API access).</p>
                </div>
            </div>

            {/* Userinfo */}
            <div class='rounded-sm bg-gray-900 border border-gray-700 p-3 text-left'>
                <div class='flex items-center justify-between'>
                    <h3 class='text-sm font-semibold text-gray-200'>Userinfo</h3>
                </div>
                {/* cURL example */}
                <div class='mt-2'>
                    <CopyTextInput value={curlExample()} label='cURL (userinfo)' id='curl-userinfo' multiline={true} />
                    <p class='text-xs text-gray-500 mt-1'>Requests userinfo using Authorization: Bearer access_token.</p>
                </div>
            </div>

            {/* Raw JSON Modal */}
            <Show when={showUserinfoModal()}>
                <div
                    class='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
                    onClick={() => setShowUserinfoModal(false)}
                >
                    <div
                        class='bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div class='sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between'>
                            <h3 class='text-lg font-bold text-white'>Raw Userinfo JSON</h3>
                            <button
                                onClick={() => setShowUserinfoModal(false)}
                                class='p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-sm transition'
                            >
                                <svg class='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>
                        <div class='p-4 overflow-auto max-h-[calc(80vh-80px)] text-left'>
                            <pre class='font-mono text-sm text-gray-200 whitespace-pre-wrap leading-relaxed bg-gray-900 border border-gray-700 p-4 rounded-sm'>
                                {userinfo()}
                            </pre>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    )
}