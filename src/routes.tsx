import { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';
import Home from './pages/Home';
import Callback from './pages/authz/Callback';

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
        path: '**',
        component: lazy(() => import('./pages/errors/NotFound')),
    },
]