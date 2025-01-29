import RegistrationCard from '@components/Profile/RegistrationCard';
import { getAccount } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Alert } from '@nextui-org/alert';
import { useDisclosure } from '@nextui-org/modal';
import { Spinner } from '@nextui-org/spinner';
import { Switch } from '@nextui-org/switch';
import { Card } from '@shared/Card';
import { DetailedAlert } from '@shared/DetailedAlert';
import { useQuery } from '@tanstack/react-query';
import { ApiAccount } from '@typedefs/blockchain';
import { RegistrationStatus } from '@typedefs/profile';
import { useEffect, useState } from 'react';
import { RiCloseLargeLine, RiNewsLine, RiUserFollowLine, RiWalletLine } from 'react-icons/ri';

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

    const [email, setEmail] = useState<string>('');
    const { isOpen, onOpen, onOpenChange } = useDisclosure(); // Confirmation email modal

    const [account, setAccount] = useState<ApiAccount>();

    const {
        refetch: fetchAccount,
        error: accountFetchError,
        isLoading: isFetchingAccount,
    } = useQuery({
        queryKey: ['fetchAccount'],
        queryFn: async () => {
            const data = await getAccount();

            console.log();

            if (!data) {
                throw new Error('Internal server error');
            }

            setAccount(data);

            return data;
        },
        enabled: false,
        retry: false,
    });

    const register = () => {
        onOpen();
    };

    const onSubmit = (e) => {
        e.preventDefault();
        console.log('register');
        register();
    };

    useEffect(() => {
        if (authenticated) {
            fetchAccount();
        }
    }, [authenticated]);

    useEffect(() => {
        if (account) {
            console.log('Account', account);
        }
    }, [account]);

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

    if (isFetchingAccount) {
        return (
            <div className="center-all p-6">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="col w-full gap-6">
            {accountFetchError ? (
                <DetailedAlert
                    variant="red"
                    icon={<RiCloseLargeLine />}
                    title="Error"
                    description={<div>The was an error fetching your profile information, please try again later.</div>}
                />
            ) : !authenticated ? (
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
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                    <RegistrationCard account={account} getRegistrationStatus={getRegistrationStatus} />

                    <Card
                        icon={<RiUserFollowLine />}
                        title="KYC"
                        label={
                            <div className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium tracking-wider text-red-700 larger:text-sm">
                                Not Started
                            </div>
                        }
                    >
                        <div className="row h-full justify-between">
                            <Alert
                                color="primary"
                                title="You need to register and confirm your email first."
                                classNames={{
                                    base: 'items-center',
                                }}
                            />
                        </div>
                    </Card>

                    {getRegistrationStatus() === RegistrationStatus.REGISTERED && (
                        <Card icon={<RiNewsLine />} title="Subscription">
                            <div className="row justify-between">
                                <div>Send me email updates.</div>
                                <Switch defaultSelected={true} size="sm" />
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

export default Profile;
