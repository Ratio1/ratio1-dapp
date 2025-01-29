import { Switch } from '@nextui-org/switch';
import { Card } from '@shared/Card';
import { ApiAccount } from '@typedefs/blockchain';
import { RegistrationStatus } from '@typedefs/profile';
import { RiNewsLine } from 'react-icons/ri';

function SubscriptionCard({
    account,
    getRegistrationStatus,
}: {
    account?: ApiAccount;
    getRegistrationStatus: () => RegistrationStatus;
}) {
    if (!account || getRegistrationStatus() !== RegistrationStatus.REGISTERED) {
        return null;
    }

    return (
        <Card icon={<RiNewsLine />} title="Subscription">
            <div className="row justify-between">
                <div>Send me email updates.</div>
                <Switch defaultSelected={account.receiveUpdates} size="sm" />
            </div>
        </Card>
    );
}

export default SubscriptionCard;
