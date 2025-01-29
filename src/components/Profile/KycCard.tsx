import { Alert } from '@nextui-org/alert';
import { Card } from '@shared/Card';
import { Label } from '@shared/Label';
import { ApiAccount } from '@typedefs/blockchain';
import { RegistrationStatus } from '@typedefs/profile';
import { useState } from 'react';
import { RiUserFollowLine } from 'react-icons/ri';

function KycCard({
    account,
    getRegistrationStatus,
}: {
    account?: ApiAccount;
    getRegistrationStatus: () => RegistrationStatus;
}) {
    const [isLoading, setLoading] = useState<boolean>(false);

    if (!account) {
        return null;
    }

    return (
        <Card icon={<RiUserFollowLine />} title="KYC" label={!account.kycStatus ? <Label text="Not Started" /> : <></>}>
            <div className="row h-full">
                {getRegistrationStatus() !== RegistrationStatus.REGISTERED && (
                    <Alert
                        color="primary"
                        title="You need to register and confirm your email first."
                        classNames={{
                            base: 'items-center',
                        }}
                    />
                )}
            </div>
        </Card>
    );
}

export default KycCard;
