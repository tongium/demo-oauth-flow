import { Show } from 'solid-js';
import { useIsLogin } from '../hooks/auth';
import Welcome from '../components/Welcome';
import Dashboard from '../components/Dashboard';


const isLogin = await useIsLogin()

export default () => {
    return (
        <Show
            when={isLogin}
            fallback={<Welcome />}
        >
            <Dashboard />
        </Show>
    )
}