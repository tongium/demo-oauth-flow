import {
    useLogin,
    authPath,
    tokenPath,
    userInfoPath,
    getAuthServer,
    getAuthClientID,
    setAuthServer,
    setAuthClientID,
    getAuthScope,
    setAuthScope,
    callbackURL
} from '../hooks/auth'
import { createSignal } from "solid-js";
import CopyTextInput from './CopyTextInput';
import TextInput from './TextInput';


export default () => {
    const [server, setServer] = createSignal(getAuthServer())
    const [clientID, setClientID] = createSignal(getAuthClientID())
    const [scope, setScope] = createSignal(getAuthScope())

    const updateClientID = (value: string) => {
        setAuthClientID(value)
        setClientID(value)
    }

    const updateScope = (value: string) => {
        setAuthScope(value)
        setScope(value)
    }

    const updateServer = (value: string) => {
        if (value.endsWith("/")) {
            value = value.substring(0, value.length - 1)
        }

        setAuthServer(value)
        setServer(value)
    }

    return (
        <div class="bg-gray-800 p-4 rounded-lg bg-opacity-50 shadow-xl max-w-md w-full">
            <h1 class="text-xl font-bold text-center mb-2 text-white">Welcome to Bacon</h1>
            <p class="text-center text-gray-400 mb-8">This website is built for demonstrating OAuth flow.</p>

            <section class="space-y-2">
                <TextInput id="auth-server" value={server()} label='Server:' onUpdate={updateServer} />
                <TextInput id="client-id" value={clientID()} label='Client ID:' onUpdate={updateClientID} />
                <TextInput id="scope" value={scope()} label='Scope:' onUpdate={updateScope} />
            </section>

            <section class="space-y-2 mt-4">
                <CopyTextInput value={callbackURL} label="Callback URL:" id="callback-url" />
                <CopyTextInput value={server() + authPath} label="Auth URL:" id="auth-url" />
                <CopyTextInput value={server() + tokenPath} label="Token URL:" id="token-url" />
                <CopyTextInput value={server() + userInfoPath} label="Userinfo URL:" id="userinfo-url" />
            </section>

            <button
                class="mt-8 w-full py-3 bg-yellow-300 hover:bg-yellow-500 text-gray-900 font-bold rounded-sm shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-75 transition duration-200 ease-in-out"
                onClick={useLogin}
            >
                Continue
            </button>

        </div >
    )
}