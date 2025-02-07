import { TestnetFaucetContractAbi } from '@blockchain/TestnetFaucet';
import { config } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes';
import { fBI } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { BigCard } from '@shared/BigCard';
import { R1ValueWithLabel } from '@shared/R1ValueWithLabel';
import { Timer } from '@shared/Timer';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiInformationLine, RiTimeLine } from 'react-icons/ri';
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

    const onClaim = async () => {
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
        fetchNextClaimTimestamp();

        setIsLoading(false);
    };

    const fetchNextClaimTimestamp = async () => {
        if (!publicClient || !address || !config.faucetContractAddress) return;

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

        fetchNextClaimTimestamp();
    }, [address]);

    return (
        <div className="center-all w-full flex-col">
            <div className="w-full sm:w-auto">
                <BigCard fullWidth>
                    <div className="text-xl font-bold lg:text-2xl">Claim $R1 tokens</div>

                    <div className="col gap-6 rounded-2xl border border-[#e3e4e8] bg-light p-6 lg:p-7">
                        <div className="col center-all w-full min-w-max gap-6 sm:min-w-[320px]">
                            <R1ValueWithLabel label="Amount to claim" value={fBI(amountPerClaim, 18)} />

                            {nextClaimTimestamp && (
                                <div>
                                    {nextClaimTimestamp.getTime() > new Date().getTime() ? (
                                        <div className="center-all col">
                                            <div className="row gap-1 text-slate-500">
                                                <RiTimeLine />
                                                <div className="text-sm">Next claim available in</div>
                                            </div>

                                            <Timer timestamp={nextClaimTimestamp} variant="compact" callback={() => {}} />
                                        </div>
                                    ) : (
                                        <div className="row gap-1 text-slate-500">
                                            <RiInformationLine />
                                            <div className="text-sm">Can be claimed once every 24 hours</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mx-auto flex">
                            <Button
                                fullWidth
                                color="primary"
                                onPress={onClaim}
                                isLoading={isLoading}
                                isDisabled={
                                    isLoading || !nextClaimTimestamp || nextClaimTimestamp.getTime() > new Date().getTime()
                                }
                            >
                                Claim
                            </Button>
                        </div>
                    </div>
                </BigCard>
            </div>
        </div>
    );
}

export default Faucet;
