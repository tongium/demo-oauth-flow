import jwt_decode from "jwt-decode"
import { useAccessToken, useIDToken, useLogout, useRefreshToken } from '../hooks/auth'

let payload = {
    sub: ""
}

try {
    payload = jwt_decode(useIDToken() || '')
    console.info(payload)
} catch (err) {
    console.error(err)
}

const token = useAccessToken()
const copy = () => {
    navigator.clipboard.writeText(token || '')
}

export default () => {
    return (
        <div class='p-10'>
            <div class='text-md'>
                You are connected with <span class="font-bold">FINNOMENA</span>
            </div>
            <div class="text-left">
                <div class='text-sm my-2'>
                    External User ID: {payload.sub}
                </div>
                <div class='text-sm my-4'>
                    <p>
                        Access Token: <input class='text-black w-[24rem] px-1 truncate' type="text" value={token || ""} id="token"></input> <button class='bg-blue-500 hover:bg-blue-700 text-white rounded px-1' onClick={copy}>copy</button>
                    </p>
                </div>
            </div>
            <div class="flex flex-row gap-4">
                <div class="mt-4">
                    <button class="bg-blue-500 text-sm hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={useLogout}>Disconect</button>
                </div>
                <div class="mt-4">
                    <button class="bg-blue-500 text-sm hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={useRefreshToken}>Refresh Token</button>
                </div>
            </div>
        </div>
    )
}