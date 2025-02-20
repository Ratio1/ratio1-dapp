import { ProtectedAdminRoute } from '@components/ProtectedAdminRoute';
import NotFound from '@pages/404';
import Dashboard from '@pages/Dashboard';
import EmailConfirmation from '@pages/EmailConfirmation';
import Faucet from '@pages/Faucet';
import KYC from '@pages/KYC';
import Licenses from '@pages/Licenses';
import PrivacyPolicy from '@pages/PrivacyPolicy';
import Profile from '@pages/Profile';
import Search from '@pages/Search';
import TermsAndConditions from '@pages/T&C';
import Unauthorized from '@pages/Unauthorized';
import {
    RiCpuLine,
    RiFunctionLine,
    RiMoneyDollarBoxLine,
    RiSearchLine,
    RiShieldUserLine,
    RiWaterFlashLine,
} from 'react-icons/ri';
import { environment } from './config';
import BuyR1 from '@pages/BuyR1';

export interface AppRoute {
    path: string;
    page: () => JSX.Element;
    icon?: JSX.Element;
}

export const routePath = {
    root: '/',
    dashboard: '/dashboard',
    licenses: '/licenses-and-nodes',
    profileKyc: '/profile-and-kyc',
    search: '/search',
    faucet: '/faucet',
    buy: '/buy',
    termsAndConditions: '/terms-and-conditions',
    privacyPolicy: '/privacy-policy',
    confirmEmail: '/confirm-email',
    notFound: '/404',
    unauthorized: '/unauthorized',
    kyc: '/kyc',
    admin: '/admin',
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
    [routePath.profileKyc]: {
        title: 'Profile & KYC',
        description: 'Manage your profile and KYC (Know Your Customer)',
        mobileTitle: 'Profile',
    },
    [routePath.search]: {
        title: 'License Checker',
        description: 'Find detailed information about any license',
        mobileTitle: 'Search',
    },
    [routePath.faucet]: {
        title: 'Faucet',
        description: 'Claim testnet $R1 tokens',
    },
    [routePath.buy]: {
        title: 'Buy',
        description: 'Buy $R1 tokens',
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
        path: routePath.profileKyc,
        page: Profile,
        icon: <RiShieldUserLine />,
    },
    {
        path: routePath.search,
        page: Search,
        icon: <RiSearchLine />,
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
                  icon: <RiMoneyDollarBoxLine />,
              },
          ]
        : []),
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
