import { Switch, Match, createResource } from 'solid-js';
import { isUserLoggedIn } from '../hooks/auth';
import Settings from '../components/Settings';
import User from '../components/User';

/**
 * Main Entry Page
 * 
 * This component acts as a "Gatekeeper". It checks if the user is 
 * logged in and shows either the User profile or the Settings screen.
 */
export default function Home() {
    // createResource is a Solid function that handles async data (like checking a session)
    const [isLogin] = createResource(isUserLoggedIn)
    
    return (
        <Switch>
            <Match when={isLogin.loading}>
                <div class='text-center text-gray-300 py-6'>Checking your session...</div>
            </Match>
            
            {/* If there's an error or we aren't logged in, show the settings */}
            <Match when={isLogin.error || isLogin() !== true}>
                <Settings />
            </Match>
            
            {/* If we ARE logged in, show the user profile */}
            <Match when={isLogin() === true}>
                <User />
            </Match>
        </Switch>
    )
}