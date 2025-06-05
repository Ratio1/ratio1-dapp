import Buy from '@components/Buy';
import Layout from '@components/Layout';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import { routes } from '@lib/routes/routes';
import { Drawer, DrawerBody, DrawerContent } from '@nextui-org/drawer';
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAccount } from 'wagmi';

function App() {
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;
    const { setLicenses, setR1Balance, isBuyDrawerOpen, onBuyDrawerClose } = useBlockchainContext() as BlockchainContextType;

    const { address } = useAccount();

    useEffect(() => {
        if (!address && !authenticated) {
            console.log('User not authenticated');
            setLicenses([]);
            setR1Balance(0n);
        }
    }, [address, authenticated]);

    return (
        <>
            <Routes>
                <Route path={routePath.root} element={<Layout />}>
                    <Route path="/" element={<Navigate to={routePath.dashboard} replace />} />

                    {routes
                        .filter((route) => !!route.page)
                        .map((route, index) => {
                            const Page = route.page as () => JSX.Element;
                            return <Route key={'route-key-' + index} path={route.path} element={<Page />} />;
                        })}
                </Route>

                <Route path="*" element={<Navigate to={routePath.notFound} replace />} />
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
