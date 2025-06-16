import { useLogin, authPath, tokenPath, userInfoPath, getAuthServer, getAuthClientID, setAuthServer, setAuthClientID } from '../hooks/auth'
import { createSignal } from "solid-js";

export default () => {
    const [server, setServer] = createSignal(getAuthServer())
    const [clientID, setClientID] = createSignal(getAuthClientID())

    const updateClientID = (value: string) => {
        setAuthClientID(value)
        setClientID(value)
    }

    const updateServer = (value: string) => {
        if (value.endsWith("/")) {
            value = value.substring(0, value.length - 1)
        }

        setAuthServer(value)
        setServer(value)
    }

    return (
        <div class="bg-gray-800 p-4 rounded-lg shadow-xl max-w-md w-full">
            <h1 class="text-3xl font-bold text-center mb-2 text-white">Welcome to Bacon</h1>
            <p class="text-center text-gray-400 mb-8">This website is built for demonstrating OAuth flow.</p>

            <section class="space-y-2">
                <div>
                    <label for="auth-server" class="block text-sm font-medium text-gray-300 mb-1 text-left">Auth Server:</label>
                    <input
                        data-testid="auth-server"
                        type="text"
                        id="auth-server"
                        value={server()}
                        class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                        onInput={(e) => {
                            updateServer(e.target.value);
                        }}
                    />
                </div>

                <div>
                    <label for="client-id" class="block text-sm font-medium text-gray-300 mb-1 text-left">Client ID:</label>
                    <input
                        data-testid="client-id"
                        type="text"
                        id="client-id"
                        value={clientID()}
                        class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                        onInput={(e) => {
                            updateClientID(e.target.value);
                        }}
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1 text-left">Auth URL:</label>
                    <div data-testid="auth-url" class="bg-green-600 bg-opacity-70 text-white px-4 py-2 rounded-md font-mono text-sm break-words">
                        {server() + authPath}
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1 text-left">Token URL:</label>
                    <div data-testid="token-url" class="bg-green-600 bg-opacity-70 text-white px-4 py-2 rounded-md font-mono text-sm break-words">
                        {server() + tokenPath}
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1 text-left">User Info URL:</label>
                    <div data-testid="userinfo-url" class="bg-green-600 bg-opacity-70 text-white px-4 py-2 rounded-md font-mono text-sm break-words">
                        {server() + userInfoPath}
                    </div>
                </div>
            </section>

            <button
                class="mt-8 w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75 transition duration-200 ease-in-out"
                onClick={useLogin}
            >
                Continue
            </button>

        </div >
    )
}