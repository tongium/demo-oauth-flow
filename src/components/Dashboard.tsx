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
        <div class='p-6'>
            <Show when={copied()}>
                <div class="fixed w-4 top-4 left-1/2 translate-x-1/2 text-center">
                    <span class="text-green-300">copied</span>
                </div>
            </Show>

            <div class='text-md mb-12'>
                You are connected with <span class="font-bold">Finnomena</span>
            </div>
            <div class="text-left">
                <div class='text-sm my-2'>
                    External User ID: <span class="font-bold bg-green-400 p-1 text-black text-lg cursor-pointer" onClick={copy(payload.sub)}>{payload.sub}</span>
                </div>
                <div class='text-sm my-4'>
                    Access Token:
                    <div class='text-black w-1/1 px-1 bg-gray-400 break-words cursor-pointer' onClick={copy(accessToken)}>{accessToken()}</div>
                </div>
                <div class='text-sm my-4'>
                    Refresh Token:
                    <div class='text-black w-1/1 px-1 bg-gray-400 break-words cursor-pointer' onClick={copy(refreshToken)}>{refreshToken()}</div>
                </div>
                <div class='text-sm my-4'>
                    Userinfo:
                    <textarea class='text-black px-1 h-full min-h-[240px] resize-none w-full bg-gray-400'>{userinfo()}</textarea>
                </div>
            </div>
            <div class="flex flex-row gap-4 justify-center pt-4">
                <button class="bg-yellow-300 text-sm hover:bg-yellow-500 text-black font-bold py-1 px-2 w-32" onClick={refresh}>Refresh</button>
                <button class="bg-yellow-300 text-sm hover:bg-yellow-500 text-black font-bold py-1 px-2 w-32" onClick={useLogout}>Logout</button>
            </div>
        </div>
    )
}