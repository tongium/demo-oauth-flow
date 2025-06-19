import { Show } from 'solid-js';
import { useIsLogin } from '../hooks/auth';
import Settings from '../components/Settings';
import User from '../components/User';


const isLogin = await useIsLogin()

export default () => {
    return (
        <Show
            when={isLogin}
            fallback={<Settings />}
        >
            <User />
        </Show>
    )
}