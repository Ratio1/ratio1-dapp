import Favicon from '@assets/favicon.png';
import Buy from '@components/Buy';
import Layout from '@components/Layout';
import { config, projectId, wagmiAdapter } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import { routes } from '@lib/routes/routes';
import { Drawer, DrawerBody, DrawerContent } from '@nextui-org/drawer';
import { Spinner } from '@nextui-org/spinner';
import { AppKit, createAppKit } from '@reown/appkit/react';
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
    const { siweConfig, authenticated } = useAuthenticationContext() as AuthenticationContextType;
    const { setLicenses, setR1Balance, isBuyDrawerOpen, onBuyDrawerOpen, onBuyDrawerClose } =
        useBlockchainContext() as BlockchainContextType;

    const { address } = useAccount();
    const [appKit, setAppKit] = useState<AppKit>();

    useEffect(() => {
        if (!address || !authenticated) {
            setLicenses([]);
            setR1Balance(0n);
        }
    }, [address]);

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
        <>
            <Routes>
                <Route path={routePath.root} element={<Layout />}>
                    <Route path="/" element={<Navigate to={routePath.dashboard} replace />} />

                    {routes.map((route, index) => (
                        <Route key={'route-key-' + index} path={route.path} element={<route.page />} />
                    ))}
                </Route>

                <Route path="*" element={<Navigate to={routePath.dashboard} replace />} />
            </Routes>

            {/* Global overlays */}
            <Drawer
                isOpen={isBuyDrawerOpen}
                onOpenChange={onBuyDrawerClose}
                size="sm"
                classNames={{
                    base: 'data-[placement=right]:sm:m-3 data-[placement=left]:sm:m-3 rounded-none sm:rounded-medium font-mona',
                }}
                motionProps={{
                    variants: {
                        enter: {
                            opacity: 1,
                            x: 0,
                        },
                        exit: {
                            x: 100,
                            opacity: 0,
                        },
                    },
                }}
                hideCloseButton
            >
                <DrawerContent>
                    <DrawerBody>
                        <Buy onClose={onBuyDrawerClose} />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default App;
