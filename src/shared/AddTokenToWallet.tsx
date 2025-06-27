import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Button } from "@heroui/button";
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

    const { data: walletClient } = useWalletClient();
    const { address, connector } = useAccount();

    const [isTokenAddedInWallet, setTokenAddedInWallet] = useState<boolean>(false);
    const localStorageKey = `${contractAddress}_added_${address}`;

    useEffect(() => {
        if (address) {
            setTokenAddedInWallet(!!localStorage.getItem(localStorageKey));
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
                localStorage.setItem(localStorageKey, 'true');
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
            <Button fullWidth className="h-[42px] px-3" variant="bordered" onPress={add}>
                <div className="row gap-1.5">
                    {!!connector?.icon && <img src={connector.icon} alt="Wallet Logo" className="h-6 w-6 rounded-full" />}
                    <div>Add ${symbol} to wallet</div>
                </div>
            </Button>
        </div>
    );
};
