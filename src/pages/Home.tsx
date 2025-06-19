import { Show } from 'solid-js';
import { useIsLogin } from '../hooks/auth';
import Settings from '../components/Settings';
import User from '../components/User';


export default () => {
    return (
        <Show
            when={useIsLogin()}
            fallback={<Settings />}
        >
            <User />
        </Show>
    )
}