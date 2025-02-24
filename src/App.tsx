import Layout from '@components/Layout';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath, routes } from '@lib/routes';
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAccount } from 'wagmi';

function App() {
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;
    const { setLicenses, setR1Balance } = useBlockchainContext() as BlockchainContextType;

    const { address } = useAccount();

    useEffect(() => {
        if (!address && !authenticated) {
            console.log('[App.tsx] User disconnected');
            setLicenses([]);
            setR1Balance(0n);
        }
    }, [address, authenticated]);

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
