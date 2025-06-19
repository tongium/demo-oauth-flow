import { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';
import Callback from './pages/authz/Callback';
import Dashboard from './components/User';
import Home from './components/Settings';

export const routes: RouteDefinition[] = [
    {
        path: '/',
        component: Home,
    },
    {
        path: '/dashboard',
        component: Dashboard,
    },
    {
        path: '/authz/callback',
        component: Callback,
    },
    {
        path: '**',
        component: lazy(() => import('./pages/errors/NotFound')),
    },
]