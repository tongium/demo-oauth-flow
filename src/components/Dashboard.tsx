import jwt_decode from "jwt-decode"
import { useAccessToken, useIDToken, useLogout, useRefreshToken, useReadRefreshToken, useGetUserinfo } from '../hooks/auth'
import { createSignal, Show, Accessor } from 'solid-js'

const [copied, setCopied] = createSignal(false)
const [accessToken, setAccessToken] = createSignal(useAccessToken())
const [refreshToken, setRefreshToken] = createSignal(useReadRefreshToken())
const [userinfo, setUserinfo] = createSignal("{}")

const updateUserinfo = async () => {
    const resp = await useGetUserinfo()
    if (resp) {
        setUserinfo(JSON.stringify(await resp.json(), null, 2))
    }
}

let payload: any = {
    sub: ""
}

try {
    const token = useIDToken()
    if (token) {
        const value = jwt_decode(token)
        if (value) {
            payload = value
            console.info(payload)
        }
    }
} catch (err) {
    console.error(err)
}

await updateUserinfo()

const copy = (accessor: Accessor<any>) => {
    return () => {
        const value = accessor()
        if (value) {
            navigator.clipboard.writeText(value)
            setCopied(true)

            setTimeout(() => {
                setCopied(false)
            }, 2000)
        }
    }
}

const refresh = async () => {
    await useRefreshToken()
    await updateUserinfo()
    setAccessToken(useAccessToken())
    setRefreshToken(useReadRefreshToken())
}

export default () => {
    return (
        <div class='p-2 max-w-[720px] mx-auto'>
            <Show when={copied()}>
                <div class="fixed w-full left-0 top-4 text-center">
                    <span class="text-green-300">copied</span>
                </div>
            </Show>

            <div class='text-md mb-8'>
                You are connected with <span class="font-bold text-lg">Finnomena.</span>
            </div>
            <div class="text-left">
                <div class='text-sm my-2'>
                    External User ID: <span data-testid="suject" class="font-bold bg-green-400 p-1 text-black text-lg cursor-pointer" onClick={copy(payload.sub)}>{payload.sub}</span>
                </div>
                <div class='text-sm my-4'>
                    Access Token:
                    <div data-testid="access-token" class='text-black w-1/1 px-1 bg-gray-400 break-words cursor-pointer' onClick={copy(accessToken)}>{accessToken()}</div>
                </div>
                <div class='text-sm my-4'>
                    Refresh Token:
                    <div data-testid="refresh-token" class='text-black w-1/1 px-1 bg-gray-400 break-words cursor-pointer' onClick={copy(refreshToken)}>{refreshToken()}</div>
                </div>
                <div class='text-sm my-4'>
                    Userinfo:
                    <textarea data-testid="user-info" class='text-black px-1 h-full min-h-[240px] resize-none w-full bg-gray-400'>{userinfo()}</textarea>
                </div>
            </div>
            <div class="flex flex-row gap-4 justify-center pt-4">
                <button id="refresh-btn" class="bg-yellow-300 text-sm hover:bg-yellow-500 text-black font-bold py-1 px-2 w-32" onClick={refresh}>Refresh</button>
                <button id="logout-btn" class="bg-yellow-300 text-sm hover:bg-yellow-500 text-black font-bold py-1 px-2 w-32" onClick={useLogout}>Logout</button>
            </div>
        </div>
    )
}