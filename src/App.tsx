import Favicon from '@assets/favicon.png';
import Layout from '@components/Layout';
import { config, projectId, wagmiAdapter } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { isParentRoute, isSimpleRoute, routePath, routes } from '@lib/routes';
import { createAppKit } from '@reown/appkit/react';
import { useEffect } from 'react';
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

    useEffect(() => {
        if (siweConfig) {
            createAppKit({
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
        }
    }, [siweConfig]);

    return (
        <Routes>
            <Route path={routePath.root} element={<Layout />}>
                <Route path="/" element={<Navigate to={routePath.dashboard} replace />} />

                {routes.map((route, index) => {
                    if (isSimpleRoute(route)) {
                        return <Route key={'route-key-' + index} path={route.path} element={<route.page />} />;
                    } else if (isParentRoute(route) && route.children && route.children.length > 0) {
                        return (
                            <Route key={'route-key-' + index} path={route.path}>
                                <Route index element={<Navigate to={route.children[0].path} replace />} />

                                {route.children.map((child, childIndex) => (
                                    <Route key={'child-route-key-' + childIndex} path={child.path} element={<child.page />} />
                                ))}
                            </Route>
                        );
                    }

                    // Fallback (not necessary if routes are validated)
                    return null;
                })}
            </Route>

            <Route path="*" element={<Navigate to={routePath.dashboard} replace />} />
        </Routes>
    );
}

export default App;
