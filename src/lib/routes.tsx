import Buy from '@pages/Buy';
import Dashboard from '@pages/Dashboard';
import { map } from 'lodash';
import { RiFunctionLine, RiStickyNoteAddLine } from 'react-icons/ri';

export interface AppRoute {
    path: string;
    page: () => JSX.Element;
    icon: JSX.Element;
    children?: AppRoute[];
    defaultChildPath?: string;
}

export const routePaths = {
    root: '/',
    dashboard: '/dashboard',
    buy: '/buy',
};

export const routeTitles = {
    [routePaths.dashboard]: 'Dashboard',
    [routePaths.buy]: 'Buy',
};

export const getRoutesArray = (): Array<{
    path: string;
    title: string;
}> => map(routeTitles, (title, route) => ({ path: route, title }));

export const routes: AppRoute[] = [
    {
        path: routePaths.dashboard,
        page: Dashboard,
        icon: <RiFunctionLine />,
    },
    {
        path: routePaths.buy,
        page: Buy,
        icon: <RiStickyNoteAddLine />,
    },
];
