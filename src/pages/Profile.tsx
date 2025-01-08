import { getShortAddress } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { useAppKit, useDisconnect } from '@reown/appkit/react';
import { useEffect } from 'react';
import { useAccount, useEnsName } from 'wagmi';

function Profile() {
    const { address } = useAccount();
    const { data, error, status } = useEnsName({ address });
    const { disconnect } = useDisconnect();

    const { open, close } = useAppKit();

    useEffect(() => {
        console.log('[Profile.tsx]');
    }, []);

    return (
        <div className="center-all flex-col gap-8 font-medium">
            <div className="flex gap-4">
                <appkit-network-button />
                <appkit-button size="md" />
            </div>

            {!!address && (
                <div className="rounded-full bg-body px-2.5 py-0.5 text-[15px] font-medium text-white">
                    {getShortAddress(address)}
                </div>
            )}

            {!!data && <div>{data}</div>}

            <button onClick={() => disconnect()} className="rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                Disconnect Wallet
            </button>

            <div className="flex">
                <Button
                    variant="solid"
                    color="primary"
                    onPress={() => {
                        open({ view: 'Connect' });
                    }}
                >
                    Open
                </Button>
            </div>
        </div>
    );
}

export default Profile;
