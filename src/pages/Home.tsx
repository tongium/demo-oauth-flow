import { Switch, Match, createResource } from 'solid-js';
import { useIsLoginAsync } from '../hooks/auth';
import Settings from '../components/Settings';
import User from '../components/User';


export default () => {
    const [isLogin] = createResource(useIsLoginAsync)
    return (
        <Switch>
            <Match when={isLogin.loading}>
                <div class='text-center text-gray-300 py-6'>Checking session...</div>
            </Match>
            <Match when={isLogin.error}>
                <Settings />
            </Match>
            <Match when={isLogin() === true}>
                <User />
            </Match>
            <Match when={true}>
                <Settings />
            </Match>
        </Switch>
    )
}