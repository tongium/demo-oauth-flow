import jwt_decode from "jwt-decode"
import { useAccessToken, useIDToken, useLogout, useRefreshToken } from '../hooks/auth'
import faCopy from './copy-solid.svg'

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
                    External User ID: <span class="font-bold">{payload.sub}</span>
                </div>
                <div class='text-sm my-4'>
                    <p>
                        Access Token: <input class='text-black w-[24rem] px-1 truncate' type="text" value={token || ""} id="token" disabled></input>
                        <button class='bg-yellow-300 font-bold hover:bg-yellow-300 text-black px-1' onClick={copy}>
                            <img src="/assets/copy-solid.svg" alt="copy" />
                        </button>
                    </p>
                </div>
            </div>
            <div class="flex flex-row gap-4 justify-center pt-4">
                <button class="bg-yellow-300 text-sm hover:bg-yellow-500 text-black font-bold py-1 px-2 w-32" onClick={useLogout}>Logout</button>
                <button class="bg-yellow-300 text-sm hover:bg-yellow-500 text-black font-bold py-1 px-2 w-32" onClick={useRefreshToken}>Refresh Token</button>
            </div>
        </div>
    )
}