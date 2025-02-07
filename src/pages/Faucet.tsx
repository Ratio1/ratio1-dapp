import { TestnetFaucetContractAbi } from '@blockchain/TestnetFaucet';
import { config } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes';
import { fBI } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { BigCard } from '@shared/BigCard';
import { LargeValueWithLabel } from '@shared/LargeValueWithLabel';
import { Timer } from '@shared/Timer';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

function Faucet() {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;
    const navigate = useNavigate();

    const [amountPerClaim, setAmountPerClaim] = useState<bigint>(0n);
    const [nextClaimTimestamp, setNextClaimTimestamp] = useState<Date | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();
    const publicClient = usePublicClient();

    const onCreate = async () => {
        if (!walletClient || !config.faucetContractAddress) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: config.faucetContractAddress,
            abi: TestnetFaucetContractAbi,
            functionName: 'claim',
        });

        await watchTx(txHash, publicClient);

        setIsLoading(false);
    };

    useEffect(() => {
        if (!config.faucetContractAddress) {
            navigate(routePath.dashboard);
            return;
        }

        if (!publicClient) return;

        publicClient
            .readContract({
                address: config.faucetContractAddress,
                abi: TestnetFaucetContractAbi,
                functionName: 'amountPerClaim',
            })
            .then(setAmountPerClaim);

        if (address) {
            publicClient
                .readContract({
                    address: config.faucetContractAddress,
                    abi: TestnetFaucetContractAbi,
                    functionName: 'getNextClaimTimestamp',
                    args: [address],
                })
                .then((timestamp) => {
                    setNextClaimTimestamp(new Date(Number(timestamp) * 1000));
                });
        }
    }, [address]);

    return (
        <BigCard>
            <div className="text-base font-semibold leading-6 lg:text-xl">Claim Testnet Tokens</div>

            <div className="col flex w-full justify-between gap-8 lg:flex-row">
                <LargeValueWithLabel label="Amount per claim" value={'$R1 ' + fBI(amountPerClaim, 18)} isCompact />

                {nextClaimTimestamp && nextClaimTimestamp.getTime() > new Date().getTime() && (
                    <div>
                        <div className="text-base font-semibold leading-6 lg:text-xl">Next claim available in</div>
                        <Timer timestamp={nextClaimTimestamp} variant="compact" callback={() => {}} />
                    </div>
                )}
            </div>

            <Button
                fullWidth
                color="primary"
                onPress={onCreate}
                isLoading={isLoading}
                isDisabled={isLoading || !nextClaimTimestamp || nextClaimTimestamp.getTime() > new Date().getTime()}
            >
                Claim
            </Button>
        </BigCard>
    );
}

export default Faucet;
