import { createEffect } from 'solid-js'
import { exchangeCodeForTokens } from '../../hooks/auth'

/**
 * OAuth Callback Page
 * 
 * This is the "hidden" page the user is sent back to after they log in 
 * at the Authorization Server. It picks up the "code" from the URL 
 * and exchanges it for real tokens.
 */
export default function Callback() {
    createEffect(async () => {
        // Look at the URL parameters
        const params = new URLSearchParams(window.location.search)

        if (params.has('code')) {
            // We have a code! Exchange it for tokens.
            await exchangeCodeForTokens(params.get('code') || '')
        } else if (params.has('error_description')) {
            // Something went wrong during login.
            console.error(`OAuth Error: ${params.get('error_description')}`)
        }

        // Always send the user back to the home page when done.
        location.href = import.meta.env.VITE_BASE_URL
    })

    return (
        <div class='text-center'>
            <p class='text-gray-400 font-medium'>Completing login...</p>
            <p class='text-sm text-gray-500 mt-2'>You will be redirected in a moment.</p>
        </div>
    )
}