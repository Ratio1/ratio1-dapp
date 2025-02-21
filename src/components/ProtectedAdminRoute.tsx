import { config } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Spinner } from '@nextui-org/spinner';
import Admin from '@pages/Admin';
import { DetailedAlert } from '@shared/DetailedAlert';
import { ConnectKitButton } from 'connectkit';
import { useEffect, useState } from 'react';
import { RiWalletLine } from 'react-icons/ri';
import { Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

export const ProtectedAdminRoute = () => {
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const [isAuthorized, setAuthorized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const { address } = useAccount();

    useEffect(() => {
        if (authenticated && address) {
            setAuthorized(address === config.safeAddress);
            setLoading(false);
        }
    }, [authenticated, address]);

    if (!authenticated) {
        return (
            <div className="col w-full p-6">
                <DetailedAlert
                    icon={<RiWalletLine />}
                    title="Connect Wallet"
                    description={
                        <div>
                            To proceed, please connect & sign in using your wallet so we can identify and display your profile.
                        </div>
                    }
                >
                    <ConnectKitButton />
                </DetailedAlert>
            </div>
        );
    }

    if (loading)
        return (
            <div className="center-all flex-1">
                <Spinner />
            </div>
        );

    if (!isAuthorized) return <Navigate to="/unauthorized" />;

    return <Admin />;
};
