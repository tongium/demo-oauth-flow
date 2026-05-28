import { createEffect } from 'solid-js'
import { revokeRefreshToken } from '../../hooks/auth'

/**
 * OAuth Logout Callback Page
 * 
 * After the user logs out at the server, they might be redirected here.
 * we take this opportunity to clean up any remaining tokens on our side.
 */
export default function Logout() {
    createEffect(async () => {
        // Tell the server we are done with our refresh token
        await revokeRefreshToken()

        // Go back to the home page
        location.href = import.meta.env.VITE_BASE_URL
    })

    return (
        <div class='text-center'>
            <p class='text-gray-400 font-medium'>Logging you out safely...</p>
            <p class='text-sm text-gray-500 mt-2'>Redirecting you shortly.</p>
        </div>
    )
}