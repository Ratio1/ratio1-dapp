import { getShortAddress } from '@lib/utils';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';

function Profile() {
    const { address } = useAccount();
    const { data, error, status } = useEnsName({ address });
    const { disconnect } = useDisconnect();

    return (
        <div className="center-all flex-col gap-4 font-medium">
            <div>Profile & KYC</div>

            <appkit-button />
            <appkit-account-button />
            <appkit-connect-button />
            <appkit-network-button />

            {!!address && (
                <div className="rounded-full bg-body px-2.5 py-0.5 text-[15px] font-medium text-white">
                    {getShortAddress(address)}
                </div>
            )}

            {!!data && <div>{data}</div>}

            <button onClick={() => disconnect()} className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                Disconnect Wallet
            </button>
        </div>
    );
}

export default Profile;
