import styles from '../App.module.css'
import logo from '../logo.svg';
import { useLogin } from '../hooks/auth'

export default () => {
    return (
        <div class='p-10'>
            <h1>
                Welcome to Bacon
            </h1>
            <p>
                This website is built for demonstrating OAuth flow.
            </p>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={useLogin}
            >
                Connect to FINNOMENA
            </button>
        </div>
    )
}