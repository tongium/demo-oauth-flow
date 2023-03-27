import CryptoJS from 'crypto-js'

const baseURL = import.meta.env.VITE_BASE_URL
const authURL = import.meta.env.VITE_AUTH_URL
const authClientID = import.meta.env.VITE_AUTH_CLIENT_ID
const callbackURL = baseURL

const authEndpoint = `${authURL}/oauth2/auth`
const tokenEndpoint = `${authURL}/oauth2/token`
const userinfoEndpoint = `${authURL}/userinfo`

const save = (key: string, value: string) => {
    localStorage.setItem(key, value)
}

const get = (key: string): string | null => {
    return localStorage.getItem(key)
}

const remove = (key: string) => {
    localStorage.removeItem(key)
}

const randomString = (length: number) => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

const convertMapToFormData = (data: Map<string, string>): string => {
    let body = ''
    for (let [key, value] of data) {
        body = `${body}&${key}=${value}`
    }
    return body.substring(1)
}

export const useIDToken = (): string | null => {
    return get("auth.id_token")
}

export const useAccessToken = (): string | null => {
    return get("auth.access_token")
}

export const useLogout = () => {
    remove("auth.access_token")
    remove("auth.id_token")
    remove("auth.refresh_token")
    remove("auth.token_type")
    remove("auth.challenge")
    remove("auth.state")
    location.href = baseURL
}

export const useLogin = () => {
    const challenge = randomString(43)
    const codeChallenge = CryptoJS.SHA256(challenge).toString(CryptoJS.enc.Base64url)
    const state = randomString(9)
    save("auth.challenge", challenge)
    save("auth.state", state)

    const url = new URL(authEndpoint)
    url.searchParams.append("client_id", authClientID)
    url.searchParams.append("redirect_uri", callbackURL)
    url.searchParams.append("state", state)
    url.searchParams.append("response_type", "code")
    url.searchParams.append("scope", "openid offline customer:account")
    url.searchParams.append("code_challenge", codeChallenge)
    url.searchParams.append("code_challenge_method", "S256")

    location.href = url.toString()
}

export const useExchangeToken = async (code: string) => {
    try {
        const challenge = get("auth.challenge")

        const data = new Map<string, string>()
        data.set('code', code)
        data.set('client_id', authClientID)
        data.set('code_verifier', challenge || '')
        data.set('redirect_uri', callbackURL)
        data.set('grant_type', 'authorization_code')

        const resp = await fetch(tokenEndpoint, {
            method: 'POST',
            body: convertMapToFormData(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        const payload = await resp.json()
        save("auth.access_token", payload.access_token)
        save("auth.id_token", payload.id_token)
        save("auth.refresh_token", payload.refresh_token)
        save("auth.token_type", payload.token_type)
    } catch (err) {
        console.error(err)
    } finally {
        location.href = baseURL
    }
}

export const useRefreshToken = async () => {
    try {
        const data = new Map<string, string>()
        data.set('client_id', authClientID)
        data.set('refresh_token', get("auth.refresh_token") || '')
        data.set('grant_type', 'refresh_token')

        const resp = await fetch(tokenEndpoint, {
            method: 'POST',
            body: convertMapToFormData(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        const payload = await resp.json()
        if (resp.status < 400) {
            save("auth.access_token", payload.access_token)
            save("auth.id_token", payload.id_token)
            save("auth.refresh_token", payload.refresh_token)
            save("auth.token_type", payload.token_type)
        } else {
            throw new Error(payload.error_description || 'can not refresh token')
        }
    } catch (err) {
        alert(err)
    }
}

export const useIsLogin = async (): Promise<boolean> => {
    const accessToken = get("auth.access_token")
    if (accessToken) {
        try {
            const tokenType = localStorage.getItem("auth.token_type")
            const resp = await fetch(userinfoEndpoint, {
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