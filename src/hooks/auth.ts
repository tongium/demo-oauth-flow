import CryptoJS from 'crypto-js'

const baseURL = import.meta.env.VITE_BASE_URL
const authURL = import.meta.env.VITE_AUTH_URL
const authClientID = import.meta.env.VITE_AUTH_CLIENT_ID
const callbackURL = baseURL

const randomString = (length: number) => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}


export const useIDToken = (): string | null => {
    return localStorage.getItem("auth.id_token")
}

export const useLogout = () => {
    localStorage.removeItem("auth.access_token")
    localStorage.removeItem("auth.id_token")
    localStorage.removeItem("auth.refresh_token")
    localStorage.removeItem("auth.token_type")
    localStorage.removeItem("auth.challenge")
    localStorage.removeItem("auth.state")
    location.href = baseURL
}

export const useLogin = () => {
    const scopes = "openid offline"

    const challenge = randomString(43)
    const state = randomString(9)
    localStorage.setItem("auth.challenge", challenge)
    localStorage.setItem("auth.state", state)

    const codeChallenge = CryptoJS.SHA256(challenge).toString(CryptoJS.enc.Base64url)
    location.href = `${authURL}/oauth2/auth?client_id=${authClientID}&redirect_uri=${encodeURIComponent(callbackURL)}&state=${state}&response_type=code&scope=${encodeURIComponent(scopes)}&code_challenge=${codeChallenge}&code_challenge_method=S256`
}

export const useExchangeToken = async (code: string) => {
    try {
        const challenge = localStorage.getItem("auth.challenge")

        const data = []
        data.push('code=' + code)
        data.push('client_id=' + authClientID)
        data.push('code_verifier=' + challenge)
        data.push('redirect_uri=' + callbackURL)
        data.push('grant_type=' + 'authorization_code')

        const resp = await fetch(`${authURL}/oauth2/token`, {
            method: 'POST',
            body: data.join('&'),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        const payload = await resp.json()
        localStorage.setItem("auth.access_token", payload.access_token)
        localStorage.setItem("auth.id_token", payload.id_token)
        localStorage.setItem("auth.refresh_token", payload.refresh_token)
        localStorage.setItem("auth.token_type", payload.token_type)
    } catch (err) {
        console.error(err)
    } finally {
        location.href = baseURL
    }
}

export const useIsLogin = async (): Promise<boolean> => {
    const accessToken = localStorage.getItem("auth.access_token")
    if (accessToken) {
        try {
            const tokenType = localStorage.getItem("auth.token_type")
            const resp = await fetch(`${authURL}/userinfo`, {
                method: 'GET',
                headers: {
                    'Authorization': `${tokenType} ${accessToken}`,
                },
            })

            return resp.status < 400
        } catch (err) {
            alert(err)
        }
    }

    return false
}