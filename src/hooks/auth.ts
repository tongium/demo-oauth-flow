import CryptoJS from 'crypto-js'
import jwt_decode from "jwt-decode"

const BASE_URL = import.meta.env.VITE_BASE_URL

const DEFAULT_CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID
const DEFAULT_SERVER = import.meta.env.VITE_AUTH_URL
const DEFAULT_SCOPE = "openid offline"

export const AUTHORIZATION_PATH = "/oauth2/auth"
export const TOKEN_PATH = "/oauth2/token"
export const USERINFO_PATH = "/userinfo"
export const LOGOUT_PATH = "/logout"

export const CALLBACK_URL = BASE_URL + "/authz/callback"

const KEY = {
    SERVER: "auth.server",
    CLIENT_ID: "auth.client_id",
    SCOPE: "auth.scope",

    ID_TOKEN: "auth.id_token",
    REFRESH_TOKEN: "auth.refresh_token",
    ACCESS_TOKEN: "auth.access_token",
    TOKEN_TYPE: "auth.token_type",
    CHALLENGE: "auth.challenge",
    STATE: "auth.state"
}

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
    return save(KEY.SERVER, server)
}

export const getAuthServer = (): string => {
    return get(KEY.SERVER) || DEFAULT_SERVER
}

export const setAuthClientID = (clientId: string) => {
    return save(KEY.CLIENT_ID, clientId)
}

export const getAuthClientID = (): string => {
    return get(KEY.CLIENT_ID) || DEFAULT_CLIENT_ID
}

export const setAuthScope = (scope: string) => {
    return save(KEY.SCOPE, scope)
}

export const getAuthScope = (): string => {
    return get(KEY.SCOPE) || DEFAULT_SCOPE
}

const authURL = (): string => getAuthServer() + AUTHORIZATION_PATH
const tokenURL = (): string => getAuthServer() + TOKEN_PATH
const userinfoURL = (): string => getAuthServer() + USERINFO_PATH
const logoutURL = (): string => getAuthServer() + LOGOUT_PATH


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
    return get(KEY.ID_TOKEN)
}

export const useAccessToken = (): string | null => {
    return get(KEY.ACCESS_TOKEN)
}

export const useReadRefreshToken = (): string | null => {
    return get(KEY.REFRESH_TOKEN)
}

export const useLogout = () => {
    remove(KEY.ACCESS_TOKEN)
    remove(KEY.ID_TOKEN)
    remove(KEY.REFRESH_TOKEN)
    remove(KEY.TOKEN_TYPE)
    remove(KEY.CHALLENGE)
    remove(KEY.STATE)

    const url = new URL(logoutURL())
    url.searchParams.append("client_id", getAuthClientID())
    url.searchParams.append("redirect_uri", BASE_URL)

    location.href = url.toString()
}

export const useLogin = () => {
    const challenge = randomString(43)
    const codeChallenge = CryptoJS.SHA256(challenge).toString(CryptoJS.enc.Base64url)
    const state = randomString(9)
    save(KEY.CHALLENGE, challenge)
    save(KEY.STATE, state)

    const url = new URL(authURL())
    url.searchParams.append("client_id", getAuthClientID())
    url.searchParams.append("redirect_uri", CALLBACK_URL)
    url.searchParams.append("state", state)
    url.searchParams.append("response_type", "code")
    url.searchParams.append("scope", getAuthScope())
    url.searchParams.append("code_challenge", codeChallenge)
    url.searchParams.append("code_challenge_method", "S256")

    location.href = url.toString()
}

export const useRequestTokensByAuthorizationCode = async (code: string) => {
    try {
        const challenge = get("auth.challenge")

        const data = new URLSearchParams()
        data.set('code', code)
        data.set('client_id', getAuthClientID())
        data.set('code_verifier', challenge || '')
        data.set('redirect_uri', CALLBACK_URL)
        data.set('grant_type', 'authorization_code')

        const resp = await fetch(tokenURL(), {
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        const payload = await resp.json()
        if (resp.status < 400) {
            save(KEY.ACCESS_TOKEN, payload.access_token)
            save(KEY.ID_TOKEN, payload.id_token)
            save(KEY.REFRESH_TOKEN, payload.refresh_token)
            save(KEY.TOKEN_TYPE, payload.token_type)
        } else {
            throw new Error(payload.error_description || "can not exchange token")
        }
    } catch (err) {
        alert(err)
    } finally {
        location.href = BASE_URL
    }
}

export const useRefreshToken = async () => {
    try {
        const data = new URLSearchParams()
        data.set('client_id', getAuthClientID())
        data.set('refresh_token', get("auth.refresh_token") || '')
        data.set('grant_type', 'refresh_token')

        const resp = await fetch(tokenURL(), {
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        const payload = await resp.json()
        if (resp.status < 400) {
            save(KEY.ACCESS_TOKEN, payload.access_token)
            save(KEY.ID_TOKEN, payload.id_token)
            save(KEY.REFRESH_TOKEN, payload.refresh_token)
            save(KEY.TOKEN_TYPE, payload.token_type)
        } else {
            throw new Error(payload.error_description || 'can not refresh token')
        }
    } catch (err) {
        alert(err)
    }
}

export const useUserInfo = async (): Promise<Response | undefined> => {
    const accessToken = get(KEY.ACCESS_TOKEN)
    if (accessToken) {
        try {
            const tokenType = get(KEY.TOKEN_TYPE)
            const resp = await fetch(userinfoURL(), {
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

export const useIsLogin = (): boolean => {
    const idToken = get(KEY.ID_TOKEN)
    if (idToken) {
        try {
            const payload: any = jwt_decode(idToken)
            if (payload && payload.exp && payload.exp > Date.now() / 1000) {
                return true
            }
        } catch (err) {
            console.error(err)
        }
    }

    return false
}
