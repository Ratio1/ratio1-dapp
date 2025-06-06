import { ProtectedAdminRoute } from '@components/ProtectedAdminRoute';
import NotFound from '@pages/404';
import BuyR1 from '@pages/BuyR1';
import Dashboard from '@pages/Dashboard';
import EmailConfirmation from '@pages/EmailConfirmation';
import Faucet from '@pages/Faucet';
import KYC from '@pages/KYC';
import Licenses from '@pages/Licenses';
import PrivacyPolicy from '@pages/PrivacyPolicy';
import Profile from '@pages/Profile';
import TermsAndConditions from '@pages/T&C';
import Unauthorized from '@pages/Unauthorized';
import { TokenSvg } from '@shared/TokenSvg';
import { RiCpuLine, RiFunctionLine, RiSearchLine, RiUserLine, RiWaterFlashLine } from 'react-icons/ri';
import { environment, getR1ExplorerUrl } from '../config';
import { routePath } from './route-paths';

export type AppRoute = {
    path: string;
    externalLink?: string;
    page?: () => JSX.Element;
    icon?: JSX.Element;
};

export const mainRoutesInfo = {
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
    [routePath.search]: {
        title: 'Explorer',
    },
    [routePath.faucet]: {
        title: 'Faucet',
        description: 'Claim $MKUSDC tokens',
    },
    [routePath.buy]: {
        title: 'Buy $R1',
        description: 'Purchase $R1 tokens',
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
    [routePath.kyc]: {
        title: 'KYC',
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
    ...(environment === 'testnet' || environment === 'devnet' //TODO enable on mainnet when LP is available
        ? [
              {
                  path: routePath.buy,
                  page: BuyR1,
                  icon: (
                      <div className="center-all h-[24px] w-[24px] layoutBreak:h-[22px] layoutBreak:w-[22px]">
                          <TokenSvg classNames="h-6 w-6 layoutBreak:h-5 layoutBreak:w-5" />
                      </div>
                  ),
              },
          ]
        : []),
    {
        path: routePath.search,
        externalLink: getR1ExplorerUrl(),
        icon: <RiSearchLine />,
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
