import jwt_decode from 'jwt-decode'
import { createEffect, createSignal } from 'solid-js'
import { useAccessToken, useIDToken, useLogout, useReadRefreshToken, useRefreshToken, useUserInfo } from '../hooks/auth'
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
    return (
        <div class='bg-gray-800 p-4 bg-opacity-50 rounded-lg shadow-xl max-w-md w-full'>
            <div class='text-md mb-6'>
                You've successfully logged in.
            </div>

            {error() && (
                <div class='bg-red-900 bg-opacity-50 border border-red-600 text-red-200 px-4 py-3 rounded-sm mb-4'>
                    {error()}
                </div>
            )}

            <div class='text-left'>
                <CopyTextInput value={subject()} label='ID (Sub):' id='subject' />
                <CopyTextInput value={accessToken() || ''} label='Access Token:' id='access-token' />
                <CopyTextInput value={refreshToken() || ''} label='Refresh Token:' id='refresh-token' />
                <CopyTextInput value={useIDToken() || ''} label='ID Token:' id='id-token' />

                <div class='text-sm my-4'>
                    <label for='user-info' class='block text-sm py-1 font-medium text-gray-300 text-left'>
                        Userinfo:
                    </label>
                    <textarea
                        id='user-info'
                        data-testid='user-info'
                        class='px-4 py-2 h-full min-h-64 rounded-sm resize-none w-full bg-gray-700 border text-gray-500 border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 ease-in-out'
                        readonly
                    >
                        {userinfo()}
                    </textarea>
                </div>
            </div>

            <div class='flex flex-row gap-4 justify-center pt-2'>
                <button
                    id='refresh-btn'
                    class='bg-yellow-200 rounded-sm hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2 px-2 w-full transition duration-200'
                    onClick={refresh}
                    disabled={loading()}
                >
                    {loading() ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                    id='logout-btn'
                    class='bg-yellow-200 rounded-sm hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2 px-2 w-full transition duration-200'
                    onClick={useLogout}
                    disabled={loading()}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}