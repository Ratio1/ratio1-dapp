import { getShortAddress } from '@lib/utils';
import { useAppKit, useDisconnect } from '@reown/appkit/react';
import { useAccount, useEnsName } from 'wagmi';

function Profile() {
    const { address } = useAccount();
    const { data, error, status } = useEnsName({ address });
    const { disconnect } = useDisconnect();

    const { open, close } = useAppKit();

    return (
        <div className="center-all flex-col gap-8 font-medium">
            <div className="flex gap-4"></div>

            {!!address && (
                <div className="rounded-full bg-body px-2.5 py-0.5 text-[15px] font-medium text-white">
                    {getShortAddress(address)}
                </div>
            )}

            {!!data && <div>{data}</div>}
        </div>
    );
}

export default Profile;
