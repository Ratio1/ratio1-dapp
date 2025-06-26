import Buy from '@components/Buy';
import Layout from '@components/Layout';
import { addReferralCode } from '@lib/api/backend';
import { domains, environment } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import { isParentRoute, isSimpleRoute, routes } from '@lib/routes/routes';
import { Drawer, DrawerBody, DrawerContent } from '@nextui-org/drawer';
import { ClosableToastContent } from '@shared/ClosableToastContent';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { RiCoupon2Line } from 'react-icons/ri';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAccount } from 'wagmi';

function App() {
    const { authenticated, account, fetchAccount } = useAuthenticationContext() as AuthenticationContextType;
    const { setLicenses, setR1Balance, isBuyDrawerOpen, onBuyDrawerClose } = useBlockchainContext() as BlockchainContextType;

    const { address } = useAccount();

    // Init
    useEffect(() => {
        if (window.innerWidth < 768) {
            toast(
                (_t) => (
                    <div className="-mx-1 text-sm text-slate-500">
                        Always confirm you're visiting
                        <br />
                        <span className="font-medium text-primary">{`https://${domains[environment]}`}</span> to avoid scams.
                    </div>
                ),
                {
                    position: 'top-center',
                    duration: 5000,
                    style: {
                        maxWidth: '98vw',
                    },
                },
            );
        } else {
            toast(
                (_t) => (
                    <div className="-mx-1 text-sm text-slate-500">
                        Always confirm you're visiting{' '}
                        <span className="font-medium text-primary">{`https://${domains[environment]}`}</span> to avoid scams.
                    </div>
                ),
                {
                    position: 'bottom-center',
                    duration: 8000,
                    style: {
                        minWidth: '416px',
                        maxWidth: '98vw',
                    },
                },
            );
        }
    }, []);

    useEffect(() => {
        if (!address && !authenticated) {
            console.log('User not authenticated');
            setLicenses([]);
            setR1Balance(0n);
        }
    }, [address, authenticated]);

    useEffect(() => {
        if (authenticated && account) {
            const referralCode = localStorage.getItem('referralCode');

            if (referralCode) {
                console.log('Calling applyReferralCode', referralCode);
                applyReferralCode(referralCode);
            }
        }
    }, [account, authenticated]);

    const applyReferralCode = async (referralCode: string) => {
        try {
            await addReferralCode(referralCode);
            localStorage.removeItem('referralCode'); // Clear it after use

            fetchAccount(); // Refresh account data after applying the code

            toast(
                (t) => (
                    <ClosableToastContent toastId={t.id} variant="success" icon={<RiCoupon2Line />}>
                        <div className="col gap-1 text-sm">
                            <div>Referral code successfully applied to your account.</div>
                        </div>
                    </ClosableToastContent>
                ),
                {
                    position: 'top-center',
                    duration: 5000,
                    style: {
                        width: '486px',
                        maxWidth: '96vw',
                        margin: '1rem',
                    },
                },
            );
        } catch (error) {
            console.error('Error applying referral code:', error);
            toast(
                (t) => (
                    <ClosableToastContent toastId={t.id} variant="error" icon={<RiCoupon2Line />}>
                        <div className="col gap-1 text-sm">
                            <div>Error applying referral code to your account.</div>
                        </div>
                    </ClosableToastContent>
                ),
                {
                    position: 'top-center',
                    duration: 5000,
                    style: {
                        width: '486px',
                        maxWidth: '96vw',
                        margin: '1rem',
                    },
                },
            );
        }
    };

    return (
        <>
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
                                        <Route
                                            key={'child-route-key-' + childIndex}
                                            path={child.path}
                                            element={<child.page />}
                                        />
                                    ))}
                                </Route>
                            );
                        }

                        // Fallback (not necessary if routes are validated)
                        return null;
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
