import Dashboard from '@pages/Dashboard';
import Licenses from '@pages/Licenses';
import Overview from '@pages/Overview';
import Rewards from '@pages/Rewards';
import { RiCpuLine, RiFunctionLine, RiStickyNoteAddLine } from 'react-icons/ri';

export interface AppRoute {
    path: string;
    icon?: JSX.Element;
}

export interface SimpleRoute extends AppRoute {
    page: () => JSX.Element;
}

export interface ParentRoute extends AppRoute {
    children: SimpleRoute[];
}

export function isSimpleRoute(route: AppRoute): route is SimpleRoute {
    return (route as SimpleRoute).page !== undefined;
}

export function isParentRoute(route: AppRoute): route is ParentRoute {
    return (route as ParentRoute).children !== undefined;
}

export const routePath = {
    root: '/',
    dashboard: '/dashboard',
    buy: '/licenses',
    nodeDeeds: '/node-deeds',
    // Relative routes (children)
    overview: 'overview',
    rewards: 'rewards',
};

export const mainRoutesInfo = {
    [routePath.dashboard]: {
        title: 'Dashboard',
        description: 'An organized view of your key information',
    },
    [routePath.buy]: {
        title: 'Licenses',
        description: 'Purchase redeemable licenses for Node Deeds',
    },
    [routePath.nodeDeeds]: {
        title: 'Node Deeds',
        description: 'Organize and manage your Node Deeds',
    },
};

export const childRouteTitles = {
    [routePath.overview]: 'Overview',
    [routePath.rewards]: 'Rewards',
};

export const routes: Array<SimpleRoute | ParentRoute> = [
    {
        path: routePath.dashboard,
        page: Dashboard,
        icon: <RiFunctionLine />,
    },
    {
        path: routePath.buy,
        page: Licenses,
        icon: <RiStickyNoteAddLine />,
    },
    {
        path: routePath.nodeDeeds,
        icon: <RiCpuLine />,
        children: [
            {
                path: routePath.overview,
                page: Overview,
            },
            {
                path: routePath.rewards,
                page: Rewards,
            },
        ],
    },
];
