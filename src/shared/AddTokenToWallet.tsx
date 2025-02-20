import Metamask from '@assets/metamask.png';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Button } from '@nextui-org/button';
import { useWalletInfo } from '@reown/appkit/react';
import { EthAddress } from '@typedefs/blockchain';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, useWalletClient } from 'wagmi';

type Props = {
    contractAddress: EthAddress;
    symbol: string;
    decimals: number;
};

export const AddTokenToWallet = ({ contractAddress, symbol, decimals }: Props) => {
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const { walletInfo } = useWalletInfo();

    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();

    const [isTokenAddedInWallet, setTokenAddedInWallet] = useState<boolean>(false);

    useEffect(() => {
        if (address) {
            setTokenAddedInWallet(!!localStorage.getItem(`${contractAddress}_added_${address}`));
        }
    }, [address]);

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
                        address: contractAddress,
                        symbol,
                        decimals,
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

    if (!authenticated || isTokenAddedInWallet) {
        return null;
    }

    return (
        <Button fullWidth className="px-3" variant="bordered" onPress={add}>
            <div className="row gap-1.5">
                {walletInfo && walletInfo.name.includes('metamask') && (
                    <div>
                        <img src={Metamask} alt="Metamask" className="h-7 w-7 rounded-full" />
                    </div>
                )}

                <div>Add ${symbol} to wallet</div>
            </div>
        </Button>
    );
};
