import Favicon from '@assets/favicon.png';
import Layout from '@components/Layout';
import { config, projectId, wagmiAdapter } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { routePath, routes } from '@lib/routes';
import { Spinner } from '@nextui-org/spinner';
import { AppKit, createAppKit } from '@reown/appkit/react';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const metadata = {
    name: 'Ratio1',
    description:
        'Experience the power of Ratio1 AI OS, built on Ratio1 Protocol and powered by blockchain, democratizing AI to empower limitless innovation.',
    url: 'https://app.ratio1.ai',
    icons: [Favicon],
};

function App() {
    const { siweConfig } = useAuthenticationContext() as AuthenticationContextType;
    const [appKit, setAppKit] = useState<AppKit>();

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

    if (!appKit) {
        return (
            <div className="center-all min-h-dvh bg-[#fcfcfd]">
                <Spinner size="lg" />
            </div>
        );
    }

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
