import { getShortAddress } from '@lib/utils';
import { useAccount, useEnsName } from 'wagmi';

function Profile() {
    const { address } = useAccount();
    const { data, error, status } = useEnsName({ address });

    return (
        <div className="center-all flex-col gap-4 font-medium">
            <div>Profile & KYC</div>

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
