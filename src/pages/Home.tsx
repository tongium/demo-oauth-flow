import { Show } from 'solid-js';
import { useIsLogin } from '../hooks/auth';
import Settings from '../components/Settings';
import Dashboard from '../components/User';


const isLogin = await useIsLogin()

export default () => {
    return (
        <Show
            when={isLogin}
            fallback={<Settings />}
        >
            <Dashboard />
        </Show>
    )
}