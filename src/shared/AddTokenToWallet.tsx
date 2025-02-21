import Metamask from '@assets/metamask.png';
import { config } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Button } from '@nextui-org/button';
import { useWalletInfo } from '@reown/appkit/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, useWalletClient } from 'wagmi';

export const AddTokenToWallet = () => {
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const { walletInfo } = useWalletInfo();

    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();

    const [isTokenAddedInWallet, setTokenAddedInWallet] = useState<boolean>(false);

    useEffect(() => {
        if (address) {
            setTokenAddedInWallet(!!localStorage.getItem(`r1added_${address}`));
        }
    }, [address]);

    useEffect(() => {
        console.log('authenticated', authenticated, address);
    }, [authenticated, address]);

    const add = async () => {
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        try {
            const wasAdded = await walletClient.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: config.r1ContractAddress,
                        symbol: 'R1',
                        decimals: 18,
                    },
                },
            });

            if (wasAdded) {
                localStorage.setItem(`r1added_${address}`, 'true');
                setTokenAddedInWallet(true);
            }
        } catch (error) {
            console.error('Error adding token:', error);
        }
    };

    if (!authenticated || !address || isTokenAddedInWallet) {
        return null;
    }

    return (
        <div className="flex">
            <Button fullWidth className="px-3" variant="bordered" onPress={add}>
                <div className="row gap-1.5">
                    {walletInfo && walletInfo.name.includes('metamask') && (
                        <div>
                            <img src={Metamask} alt="Metamask" className="h-7 w-7 rounded-full" />
                        </div>
                    )}

                    <div>Add $R1 to wallet</div>
                </div>
            </Button>
        </div>
    );
};
