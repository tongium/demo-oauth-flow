import { useLogin } from '../hooks/auth'

export default () => {
    return (
        <div class='p-8'>
            <h1>
                Welcome to Bacon
            </h1>
            <section>
                <p>
                    This website is built for demonstrating OAuth flow.
                </p>
            </section>
            <section class="my-4">
                <button class="bg-yellow-300 hover:bg-yellow-500 text-black font-bold py-2 px-4 m-2"
                    onClick={useLogin}
                >
                    Login with Finnomena.
                </button>
            </section>
        </div>
    )
}