import { createEffect } from 'solid-js'
import { useRevokeRefreshToken } from '../../hooks/auth'

export default () => {
    // Handle OAuth callback in effect hook, not at module level
    createEffect(async () => {
        await useRevokeRefreshToken()
        location.href = import.meta.env.VITE_BASE_URL
    })

    return (
        <div class='text-center'>
            <p class='text-gray-400'>Processing OAuth callback...</p>
            <p class='text-sm text-gray-500 mt-2'>You will be redirected shortly.</p>
        </div>
    )
}