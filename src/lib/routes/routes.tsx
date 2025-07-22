import { ProtectedAdminRoute } from '@components/ProtectedAdminRoute';
import NotFound from '@pages/404';
import BuyR1 from '@pages/BuyR1';
import PrivacyPolicy from '@pages/compliance/PrivacyPolicy';
import TermsAndConditions from '@pages/compliance/T&C';
import TermsOfUseNDs from '@pages/compliance/TermsOfUseNDs';
import Dashboard from '@pages/Dashboard';
import EmailConfirmation from '@pages/EmailConfirmation';
import Faucet from '@pages/Faucet';
import KYC from '@pages/KYC';
import Licenses from '@pages/Licenses';
import Profile from '@pages/Profile';
import Unauthorized from '@pages/Unauthorized';
import { TokenSvg } from '@shared/TokenSvg';
import { RiCpuLine, RiFunctionLine, RiSearchLine, RiShieldLine, RiUserLine, RiWaterFlashLine } from 'react-icons/ri';
import { environment, getR1ExplorerUrl } from '../config';
import { routePath } from './route-paths';

export type BaseRoute = {
    path: string;
    icon?: React.ReactNode;
};

export type SimpleRoute = BaseRoute & {
    page: () => JSX.Element;
};

export type ExternalRoute = BaseRoute & {
    externalLink: string;
};

export type ChildRoute = {
    path: string;
    page: () => JSX.Element;
};

export type ParentRoute = BaseRoute & {
    children: ChildRoute[];
};

export type AppRoute = SimpleRoute | ParentRoute | ExternalRoute;

export function isSimpleRoute(route: AppRoute): route is SimpleRoute {
    return 'page' in route;
}

export function isParentRoute(route: AppRoute): route is ParentRoute {
    return 'children' in route;
}

export function isExternalRoute(route: AppRoute): route is ExternalRoute {
    return 'externalLink' in route;
}

export const routeInfo = {
    [routePath.dashboard]: {
        title: 'Dashboard',
        description: 'An organized view of your key information',
        mobileTitle: 'Home',
    },
    [routePath.licenses]: {
        title: 'Licenses & Nodes',
        description: 'View, organize & assign your licenses to nodes',
        mobileTitle: 'Licenses',
    },
    [routePath.profile]: {
        title: 'Profile',
        description: 'Manage your profile, referral and KYC (Know Your Customer)',
        mobileTitle: 'Profile',
    },
    [`${getR1ExplorerUrl()}`]: {
        title: 'Explorer',
    },
    [routePath.faucet]: {
        title: 'Faucet',
        description: 'Claim $MKUSDC tokens',
    },
    [routePath.buy]: {
        title: 'Buy $R1',
        description: 'Swap for $R1 using the available tokens',
    },
    [routePath.compliance]: {
        title: 'Compliance',
    },
    [`${routePath.compliance}/${routePath.termsAndConditions}`]: {
        title: 'Terms & Conditions',
        description: 'Terms governing your use of our services',
    },
    [`${routePath.compliance}/${routePath.termsOfUseNDs}`]: {
        title: 'Terms of Use NDs',
        description: 'Terms governing the use and operation of Edge Node licenses',
    },
    [`${routePath.compliance}/${routePath.privacyPolicy}`]: {
        title: 'Privacy Policy',
        description: 'Understand how we handle and protect your personal data',
    },
    [routePath.confirmEmail]: {
        title: 'Email Confirmation',
    },
    [routePath.kyc]: {
        title: 'KYC (Know Your Customer)',
        description: 'Ensure compliance and security with identity verification',
    },
    [routePath.admin]: {
        title: 'Admin',
        description: 'Admin panel for managing contracts',
    },
    [routePath.notFound]: {
        title: 'Not Found',
    },
    [routePath.unauthorized]: {
        title: 'Unauthorized',
    },
};

// Routes with icons are displayed in the main navigation
export const routes: AppRoute[] = [
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
        path: routePath.profile,
        page: Profile,
        icon: <RiUserLine />,
    },
    ...(environment === 'testnet' || environment === 'devnet'
        ? [
              {
                  path: routePath.faucet,
                  page: Faucet,
                  icon: <RiWaterFlashLine />,
              },
          ]
        : []),
    {
        path: routePath.buy,
        page: BuyR1,
        icon: (
            <div className="center-all h-[24px] w-[24px] layoutBreak:h-[22px] layoutBreak:w-[22px]">
                <TokenSvg classNames="h-6 w-6 layoutBreak:h-5 layoutBreak:w-5" />
            </div>
        ),
    },
    {
        path: getR1ExplorerUrl(),
        externalLink: getR1ExplorerUrl(),
        icon: <RiSearchLine />,
    },
    {
        path: routePath.compliance,
        icon: <RiShieldLine />,
        children: [
            {
                path: routePath.termsAndConditions,
                page: TermsAndConditions,
            },
            {
                path: routePath.termsOfUseNDs,
                page: TermsOfUseNDs,
            },
            {
                path: routePath.privacyPolicy,
                page: PrivacyPolicy,
            },
        ],
    },
    {
        path: routePath.confirmEmail,
        page: EmailConfirmation,
    },
    {
        path: routePath.kyc,
        page: KYC,
    },
    {
        path: routePath.admin,
        page: ProtectedAdminRoute,
    },
    {
        path: routePath.notFound,
        page: NotFound,
    },
    {
        path: routePath.unauthorized,
        page: Unauthorized,
    },
];

export const getNavigationRoutes = () => {
    const mainnetOnly = [routePath.profile];

    return routes.filter((route: AppRoute) => {
        if (environment !== 'mainnet' && mainnetOnly.includes(route.path)) {
            return false;
        }

        return !!route.icon;
    });
};

export const getMobileNavigationRoutes = () => {
    const mainnetOnly = [routePath.profile];

    return routes.filter((route: AppRoute) => {
        if ((environment !== 'mainnet' && mainnetOnly.includes(route.path)) || route.path === routePath.compliance) {
            return false;
        }

        return !!route.icon;
    });
};
