import styles from '../App.module.css'
import logo from '../logo.svg';
import { useLogin } from '../hooks/auth'

export default () => {
    return (
        <header class={styles.header}>
            <img src={logo} class={styles.logo} alt="logo" />
            <p>
                Welcome to Bacon
            </p>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={useLogin}
            >
                Connect to FINNOMENA
            </button>
        </header>
    )
}