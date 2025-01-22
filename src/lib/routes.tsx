import NotFound from '@pages/404';
import Dashboard from '@pages/Dashboard';
import EmailConfirmation from '@pages/EmailConfirmation';
import Licenses from '@pages/Licenses';
import PrivacyPolicy from '@pages/PrivacyPolicy';
import Profile from '@pages/Profile';
import Search from '@pages/Search';
import TermsAndConditions from '@pages/T&C';
import { RiCpuLine, RiFileSearchLine, RiFunctionLine, RiShieldUserLine } from 'react-icons/ri';

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
    licenses: '/licenses-and-nodes',
    profileKyc: '/profile-and-kyc',
    search: '/search',
    termsAndConditions: '/terms-and-conditions',
    privacyPolicy: '/privacy-policy',
    confirmEmail: '/confirm-email',
    notFound: '/404',
};

export const mainRoutesInfo = {
    [routePath.dashboard]: {
        title: 'Dashboard',
        description: 'An organized view of your key information',
    },
    [routePath.licenses]: {
        title: 'Licenses & Nodes',
        description: 'Organize & assign your licenses to nodes',
    },
    [routePath.profileKyc]: {
        title: 'Profile & KYC',
        description: 'Manage your profile and KYC (Know Your Customer)',
    },
    [routePath.search]: {
        title: 'License Checker',
        description: 'Find detailed information about any license',
    },
    [routePath.termsAndConditions]: {
        title: 'Terms & Conditions',
        description: 'Terms governing your use of our services',
    },
    [routePath.privacyPolicy]: {
        title: 'Privacy Policy',
        description: 'Understand how we handle and protect your personal data',
    },
    [routePath.confirmEmail]: {
        title: 'Email Confirmation',
    },
    [routePath.notFound]: {
        title: 'Not Found',
    },
};

export const routes: Array<SimpleRoute | ParentRoute> = [
    {
        path: routePath.dashboard,
        page: Dashboard,
        icon: <RiFunctionLine />,
    },
    {
        path: routePath.licenses,
        page: Licenses,
        icon: <RiCpuLine />,
    },
    {
        path: routePath.profileKyc,
        page: Profile,
        icon: <RiShieldUserLine />,
    },
    {
        path: routePath.search,
        page: Search,
        icon: <RiFileSearchLine />,
    },
    {
        path: routePath.termsAndConditions,
        page: TermsAndConditions,
    },
    {
        path: routePath.privacyPolicy,
        page: PrivacyPolicy,
    },
    {
        path: routePath.confirmEmail,
        page: EmailConfirmation,
    },
    {
        path: routePath.notFound,
        page: NotFound,
    },
];
