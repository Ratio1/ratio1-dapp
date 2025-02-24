import KycCard from '@components/Profile/KycCard';
import RegistrationCard from '@components/Profile/RegistrationCard';
import SubscriptionCard from '@components/Profile/SubscriptionCard';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Spinner } from '@nextui-org/spinner';
import { DetailedAlert } from '@shared/DetailedAlert';
import { RegistrationStatus } from '@typedefs/profile';
import { ConnectKitButton } from 'connectkit';
import { RiCloseLargeLine, RiWalletLine } from 'react-icons/ri';

function Profile() {
    const { authenticated, account, isFetchingAccount, accountFetchError } =
        useAuthenticationContext() as AuthenticationContextType;

    const getRegistrationStatus = (): RegistrationStatus => {
        if (account && account.email && account.emailConfirmed) {
            return RegistrationStatus.REGISTERED;
        }

        if (account && account.pendingEmail && !account.emailConfirmed) {
            return RegistrationStatus.NOT_CONFIRMED;
        }

        return RegistrationStatus.NOT_REGISTERED;
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
                    <ConnectKitButton />
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
            <RegistrationCard getRegistrationStatus={getRegistrationStatus} />

            <KycCard getRegistrationStatus={getRegistrationStatus} />

            <SubscriptionCard getRegistrationStatus={getRegistrationStatus} />
        </div>
    );
}

export default Profile;
