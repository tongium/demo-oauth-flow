import { useRequestTokensByAuthorizationCode } from '../../hooks/auth';

const params = new URLSearchParams(window.location.search)
if (params.has('code')) {
    await useRequestTokensByAuthorizationCode(params.get('code') || "")
} else if (params.has('error_description')) {
    alert(params.get('error_description'))
}

export default () => {
    return (
        <div>This URL serves as the redirection endpoint for the OAuth token exchange process.</div>
    )
}