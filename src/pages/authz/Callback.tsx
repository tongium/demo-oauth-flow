import { createEffect } from 'solid-js'
import { useRequestTokensByAuthorizationCode } from '../../hooks/auth'

export default () => {
    // Handle OAuth callback in effect hook, not at module level
    createEffect(() => {
        const params = new URLSearchParams(window.location.search)

        if (params.has('code')) {
            useRequestTokensByAuthorizationCode(params.get('code') || '')
        } else if (params.has('error_description')) {
            alert(`OAuth Error: ${params.get('error_description')}`)
            // Redirect to home on error
            location.href = import.meta.env.VITE_BASE_URL
        }
    })

    return (
        <div class='text-center'>
            <p class='text-gray-400'>Processing OAuth callback...</p>
            <p class='text-sm text-gray-500 mt-2'>You will be redirected shortly.</p>
        </div>
    )
}