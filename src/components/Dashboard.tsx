import jwt_decode from "jwt-decode"
import { useAccessToken, useIDToken, useLogout, useRefreshToken, useReadRefreshToken, useUserInfo } from '../hooks/auth'
import { createSignal } from 'solid-js'
import CopyTextInput from "./CopyTextInput"

const [accessToken, setAccessToken] = createSignal(useAccessToken())
const [refreshToken, setRefreshToken] = createSignal(useReadRefreshToken())
const [userinfo, setUserinfo] = createSignal("{}")

const updateUserinfo = async () => {
    const resp = await useUserInfo()
    if (resp) {
        setUserinfo(JSON.stringify(await resp.json(), null, 4))
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

const refresh = async () => {
    await useRefreshToken()
    await updateUserinfo()
    setAccessToken(useAccessToken())
    setRefreshToken(useReadRefreshToken())
}

export default () => {
    return (
        <div class='bg-gray-800 p-4 bg-opacity-50 rounded-lg shadow-xl max-w-md w-full'>
            <div class='text-md mb-6'>
                You've successfully logged in.
            </div>
            <div class="text-left">
                <CopyTextInput value={payload.sub} label="ID (Sub):" id="subject" />
                <CopyTextInput value={accessToken()} label="Access Token:" id="access-token" />
                <CopyTextInput value={refreshToken()} label="Refresh Token:" id="refresh-token" />
                <CopyTextInput value={useIDToken()} label="ID Token:" id="id-token" />

                <div class='text-sm my-4'>
                    <label for="user-info" class="block text-sm py-1 font-medium text-gray-300 text-left">Userinfo:</label>
                    <textarea id="user-info" data-testid="user-info" class='px-4 py-2 h-full min-h-64 rounded-sm resize-none w-full bg-gray-700 border text-gray-500 border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 ease-in-out'>
                        {userinfo()}
                    </textarea>
                </div>
            </div>
            <div class="flex flex-row gap-4 justify-center pt-2">
                <button id="refresh-btn" class="bg-yellow-300 rounded-sm hover:bg-yellow-500 text-black font-bold py-2 px-2 w-full" onClick={refresh}>Refresh</button>
                <button id="logout-btn" class="bg-yellow-300 rounded-sm hover:bg-yellow-500 text-black font-bold py-2 px-2 w-full" onClick={useLogout}>Logout</button>
            </div>
        </div>
    )
}