import styles from '../App.module.css'
import jwt_decode from "jwt-decode"
import { useIDToken, useLogout } from '../hooks/auth'

let payload = {
    sub: ""
}

const token = useIDToken()
if (token) {
    try {
        payload = jwt_decode(token)
        console.info(payload)
    } catch (err) {
        console.error(err)
    }
}

const copy = () => {
    navigator.clipboard.writeText(token || '')
}

export default () => {
    return (
        <div>
            <header class={styles.header}>
                <div class='text-md'>
                    You are connected with FINNOMENA
                </div>
                <div class='text-sm'>
                    Partner User ID: {payload.sub}
                </div>
                <div class='text-sm my-1'>
                    <p >
                        Token: <input class='text-black w-[24rem] px-1 truncate' type="text" value={token || ""} id="token"></input> <button class='bg-blue-500 hover:bg-blue-700 text-white rounded px-1' onClick={copy}>copy</button>
                    </p>
                    Can introspect id token at <a class="underline" href='https://jwt.io/' target="_blank" rel="noopener noreferrer">here</a>.
                </div>
                <div class="mt-4">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={useLogout}>Disconect</button>
                </div>
            </header>
        </div>
    )
}