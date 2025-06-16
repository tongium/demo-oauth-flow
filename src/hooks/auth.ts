import CryptoJS from 'crypto-js'

const baseURL = import.meta.env.VITE_BASE_URL

const defaultAuthClientID = import.meta.env.VITE_AUTH_CLIENT_ID
const defaultAuthServer = import.meta.env.VITE_AUTH_URL

export const authPath = "/oauth2/auth"
export const tokenPath = "/oauth2/token"
export const userInfoPath = "/userinfo"
export const callbackURL = `${baseURL}/authz/callback`
export const scope = "openid offline customer:account"

const save = (key: string, value: string) => {
    localStorage.setItem(key, value)
}

const get = (key: string): string | null => {
    return localStorage.getItem(key)
}

const remove = (key: string) => {
    localStorage.removeItem(key)
}

export const setAuthServer = (server: string) => {
    return save("auth.server", server)
}

export const getAuthServer = (): string => {
    return get("auth.server") || defaultAuthServer
}

export const setAuthClientID = (clientId: string) => {
    return save("auth.client_id", clientId)
}

export const getAuthClientID = (): string => {
    return get("auth.client_id") || defaultAuthClientID
}

const getAuthUrl = (): string => {
    return getAuthServer() + authPath
}

const getTokenUrl = (): string => {
    return getAuthServer() + tokenPath
}

const getUserInfoUrl = (): string => {
    return getAuthServer() + userInfoPath
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

export const useReadRefreshToken = (): string | null => {
    return get("auth.refresh_token")
}

export const useLogout = () => {
    remove("auth.access_token")
    remove("auth.id_token")
    remove("auth.refresh_token")
    remove("auth.token_type")
    remove("auth.challenge")
    remove("auth.state")
    location.href = `${getAuthServer()}/logout?client_id=${getAuthClientID()}&redirect_uri=${encodeURIComponent(baseURL)}`
}

export const useLogin = () => {
    const challenge = randomString(43)
    const codeChallenge = CryptoJS.SHA256(challenge).toString(CryptoJS.enc.Base64url)
    const state = randomString(9)
    save("auth.challenge", challenge)
    save("auth.state", state)

    const url = new URL(getAuthUrl())
    url.searchParams.append("client_id", getAuthClientID())
    url.searchParams.append("redirect_uri", callbackURL)
    url.searchParams.append("state", state)
    url.searchParams.append("response_type", "code")
    url.searchParams.append("scope", scope)
    url.searchParams.append("code_challenge", codeChallenge)
    url.searchParams.append("code_challenge_method", "S256")

    location.href = url.toString()
}

export const useExchangeToken = async (code: string) => {
    try {
        const challenge = get("auth.challenge")

        const data = new Map<string, string>()
        data.set('code', code)
        data.set('client_id', getAuthClientID())
        data.set('code_verifier', challenge || '')
        data.set('redirect_uri', callbackURL)
        data.set('grant_type', 'authorization_code')

        const resp = await fetch(getTokenUrl(), {
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

        location.href = baseURL
    } catch (err) {
        console.error(err)
    }
}

export const useRefreshToken = async () => {
    try {
        const data = new Map<string, string>()
        data.set('client_id', getAuthClientID())
        data.set('refresh_token', get("auth.refresh_token") || '')
        data.set('grant_type', 'refresh_token')

        const resp = await fetch(getTokenUrl(), {
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

export const useGetUserinfo = async (): Promise<Response | undefined> => {
    const accessToken = get("auth.access_token")
    if (accessToken) {
        try {
            const tokenType = get("auth.token_type")
            const resp = await fetch(getUserInfoUrl(), {
                method: 'GET',
                headers: {
                    'Authorization': `${tokenType} ${accessToken}`,
                },
            })

            return resp
        } catch (err) {
            console.error(err)
        }
    }
}

export const useIsLogin = async (): Promise<boolean> => {
    const userinfo = await useGetUserinfo()
    if (userinfo) {
        return true
    }

    return false
}
