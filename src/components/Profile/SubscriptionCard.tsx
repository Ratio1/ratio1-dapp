import { emailSubscribe, emailUnsubscribe } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Switch } from "@heroui/switch";
import { Card } from '@shared/Card';
import { ApiAccount } from '@typedefs/blockchain';
import { RegistrationStatus } from '@typedefs/profile';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiNewsLine } from 'react-icons/ri';

function SubscriptionCard({ getRegistrationStatus }: { getRegistrationStatus: () => RegistrationStatus }) {
    const { account } = useAuthenticationContext() as AuthenticationContextType;

    const [isSelected, setSelected] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // Initialize the selected state based on the account's preference
        if (account) {
            setSelected(account.receiveUpdates);
        }
    }, [account]);

    if (!account || getRegistrationStatus() !== RegistrationStatus.REGISTERED) {
        return null;
    }

    const toggle = async () => {
        if (isLoading) {
            return;
        }

        // We set the new value optimistically
        setSelected(!isSelected);

        const apiCall: () => Promise<ApiAccount> = isSelected ? emailUnsubscribe : emailSubscribe;

        try {
            setLoading(true);
            const accountResponse = await apiCall();

            setSelected(accountResponse.receiveUpdates);
            toast.success('Subscription preference updated!');
        } catch (error) {
            console.error('Error', error);
            toast.error('Unexpected error, please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card icon={<RiNewsLine />} title="Subscription">
            <div className="flex h-full w-full items-center">
                <div className="row w-full justify-between">
                    <div className="text-sm larger:text-base">Receive important updates via email.</div>
                    <Switch isSelected={isSelected} onValueChange={toggle} size="sm" />
                </div>
            </div>
        </Card>
    );
}

export default SubscriptionCard;
