import jwt_decode from "jwt-decode"
import { useAccessToken, useIDToken, useLogout, useRefreshToken } from '../hooks/auth'

let payload = {
    sub: ""
}

try {
    const token = useIDToken()
    if (token) {
        payload = jwt_decode(token)
        console.info(payload)
    }
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
            <div class='text-md mb-12'>
                You are connected with <span class="font-bold">Finnomena</span>
            </div>
            <div class="text-left">
                <div class='text-sm my-2'>
                    External User ID: <span class="font-bold bg-green-400 p-2 text-black">{payload.sub}</span>
                </div>
                <div class='text-sm my-4'>
                    Access Token:
                    <div class='text-black w-[24rem] px-1 bg-gray-400 break-words cursor-pointer' id="token" onClick={copy}>{token}</div>
                </div>
            </div>
            <div class="flex flex-row gap-4 justify-center pt-4">
                <button class="bg-yellow-300 text-sm hover:bg-yellow-500 text-black font-bold py-1 px-2 w-32" onClick={useLogout}>Logout</button>
            </div>
        </div>
    )
}