import { getShortAddress } from '@lib/utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useEnsName } from 'wagmi';

function Profile() {
    const { address } = useAccount();
    const { data, error, status } = useEnsName({ address });

    return (
        <div className="center-all flex-col gap-4 font-medium">
            <div>Profile & KYC</div>

            <div className="flex">
                <ConnectButton />
            </div>

            {!!address && <div>{getShortAddress(address)}</div>}

            {!!data && <div>ENS: {data}</div>}
        </div>
    );
}

export default Profile;
