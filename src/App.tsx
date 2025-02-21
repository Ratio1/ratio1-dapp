import Favicon from '@assets/favicon.png';
import Layout from '@components/Layout';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath, routes } from '@lib/routes';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAccount } from 'wagmi';

const metadata = {
    name: 'Ratio1',
    description:
        'Experience the power of Ratio1 AI OS, built on Ratio1 Protocol and powered by blockchain, democratizing AI to empower limitless innovation.',
    url: 'https://app.ratio1.ai',
    icons: [Favicon],
};

function App() {
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;
    const { setLicenses, setR1Balance } = useBlockchainContext() as BlockchainContextType;

    const { address } = useAccount();

    useEffect(() => {
        if (!address || !authenticated) {
            console.log('[App.tsx] User disconnected');
            setLicenses([]);
            setR1Balance(0n);
        }
    }, [address]);

    /*
    useEffect(() => {
        if (siweConfig) {
            const appKit: AppKit = createAppKit({
                adapters: [wagmiAdapter],
                projectId,
                networks: config.networks as any,
                defaultNetwork: config.networks[0],
                metadata,
                features: {
                    analytics: true,
                    swaps: false,
                    onramp: false,
                    email: false,
                    socials: [],
                },
                siweConfig,
                enableWalletConnect: true,
                allWallets: 'HIDE',
                termsConditionsUrl: 'https://app.ratio1.ai/terms-and-conditions',
                themeMode: 'light',
                themeVariables: {
                    '--w3m-font-family': 'Mona Sans',
                    '--w3m-accent': '#1b47f7',
                },
            });

            setAppKit(appKit);
        }
    }, [siweConfig]);
    */

    return (
        <Routes>
            <Route path={routePath.root} element={<Layout />}>
                <Route path="/" element={<Navigate to={routePath.dashboard} replace />} />

                {routes.map((route, index) => (
                    <Route key={'route-key-' + index} path={route.path} element={<route.page />} />
                ))}
            </Route>

            <Route path="*" element={<Navigate to={routePath.dashboard} replace />} />
        </Routes>
    );
}

export default App;
