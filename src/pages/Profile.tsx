import KycCard from '@components/Profile/KycCard';
import RegistrationCard from '@components/Profile/RegistrationCard';
import SubscriptionCard from '@components/Profile/SubscriptionCard';
import { getAccount } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Spinner } from '@nextui-org/spinner';
import { DetailedAlert } from '@shared/DetailedAlert';
import { useQuery } from '@tanstack/react-query';
import { ApiAccount } from '@typedefs/blockchain';
import { RegistrationStatus } from '@typedefs/profile';
import { useEffect, useState } from 'react';
import { RiCloseLargeLine, RiWalletLine } from 'react-icons/ri';

const ACCOUNT: ApiAccount = {
    email: '', // Or any placeholder you prefer
    emailConfirmed: false,
    pendingEmail: '', // Or any placeholder
    address: '', // Replace with a real address or placeholder
    uuid: '', // Replace with a generated UUID
    kycStatus: 'NOT_STARTED', // Or any other appropriate initial value
    isActive: false,
    isBlacklisted: false,
    blacklistedReason: '', // Or a default reason if needed
    receiveUpdates: false,
};

function Profile() {
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;
    const [account, setAccount] = useState<ApiAccount>();

    const {
        refetch: fetchAccount,
        error: accountFetchError,
        isLoading: isFetchingAccount,
    } = useQuery({
        queryKey: ['fetchAccount'],
        queryFn: async () => {
            const data = await getAccount();

            console.log('Account', data);

            if (!data) {
                throw new Error('Internal server error');
            }

            setAccount(data);

            return data;
        },
        enabled: false,
        retry: false,
    });

    useEffect(() => {
        if (authenticated) {
            fetchAccount();
        }
    }, [authenticated]);

    const getRegistrationStatus = (): RegistrationStatus => {
        if (account && account.email) {
            if (account.emailConfirmed) {
                return RegistrationStatus.REGISTERED;
            } else {
                return RegistrationStatus.NOT_CONFIRMED;
            }
        } else {
            return RegistrationStatus.NOT_REGISTERED;
        }
    };

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
                    <appkit-connect-button />
                </DetailedAlert>
            </div>
        );
    }

    if (isFetchingAccount) {
        return (
            <div className="center-all p-6">
                <Spinner />
            </div>
        );
    }

    if (accountFetchError) {
        return (
            <div className="col w-full p-6">
                <DetailedAlert
                    variant="red"
                    icon={<RiCloseLargeLine />}
                    title="Error"
                    description={<div>The was an error fetching your profile information, please try again later.</div>}
                />
            </div>
        );
    }

    return (
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <RegistrationCard account={account} getRegistrationStatus={getRegistrationStatus} />

            <KycCard account={account} getRegistrationStatus={getRegistrationStatus} />

            <SubscriptionCard account={account} getRegistrationStatus={getRegistrationStatus} />
        </div>
    );
}

export default Profile;
