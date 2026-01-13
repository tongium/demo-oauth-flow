import { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';
import Home from './pages/Home';
import Callback from './pages/authz/Callback';
import Logout from './pages/authz/Logout';

export const routes: RouteDefinition[] = [
    {
        path: '/',
        component: Home,
    },
    {
        path: '/authz/callback',
        component: Callback,
    },
    {
        path: '/authz/logout',
        component: Logout,
    },
    {
        path: '**',
        component: lazy(() => import('./pages/errors/NotFound')),
    },
]