import Alchemy from '@assets/faucets/alchemy.png';
import Coinbase from '@assets/faucets/coinbase.png';
import Optimism from '@assets/faucets/optimism.jpeg';
import Thirdweb from '@assets/faucets/thirdweb.png';
import { TestnetFaucetContractAbi } from '@blockchain/TestnetFaucet';
import { Button } from '@heroui/button';
import { config, getDevAddress, isDebugging } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import { fBI } from '@lib/utils';
import { AddTokenToWallet } from '@shared/AddTokenToWallet';
import { BigCard } from '@shared/BigCard';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import { Timer } from '@shared/Timer';
import { TokenValueWithLabel } from '@shared/TokenValueWithLabel';
import { EthAddress } from '@typedefs/blockchain';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiInformationLine, RiTimeLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

function Faucet() {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const navigate = useNavigate();

    const [amountPerClaim, setAmountPerClaim] = useState<bigint>(0n);
    const [tokenAddress, setTokenAddress] = useState<EthAddress | null>(null);
    const [nextClaimTimestamp, setNextClaimTimestamp] = useState<Date | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const { address } = isDebugging ? getDevAddress() : useAccount();
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

        publicClient
            .readContract({
                address: config.faucetContractAddress,
                abi: TestnetFaucetContractAbi,
                functionName: 'token',
            })
            .then(setTokenAddress);

        fetchNextClaimTimestamp();
    }, [address]);

    return (
        <div className="center-all w-full flex-col">
            <div className="w-full sm:w-auto">
                <BigCard fullWidth>
                    <div className="text-xl font-bold lg:text-2xl">Claim fake $USDC tokens</div>

                    <div className="col center-all w-full gap-6 rounded-2xl border border-[#e3e4e8] bg-light p-6 sm:min-w-[320px] md:w-[480px] lg:p-7">
                        <div className="col center-all w-full gap-6">
                            <TokenValueWithLabel label="Amount to claim" symbol="MKUSDC" value={fBI(amountPerClaim, 6)} />

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

                        <div className="col gap-2.5">
                            <div className="mx-auto flex">
                                <ConnectWalletWrapper>
                                    <Button
                                        color="primary"
                                        onPress={onClaim}
                                        isLoading={isLoading}
                                        isDisabled={
                                            isLoading ||
                                            !authenticated ||
                                            !nextClaimTimestamp ||
                                            nextClaimTimestamp.getTime() > new Date().getTime()
                                        }
                                    >
                                        Claim
                                    </Button>
                                </ConnectWalletWrapper>
                            </div>

                            {tokenAddress && <AddTokenToWallet contractAddress={tokenAddress} symbol="MKUSDC" decimals={6} />}
                        </div>

                        <div className="col center-all gap-4">
                            <div className="text-center text-sm text-slate-500">
                                Signing transactions for the faucet and linking your node to your license require{' '}
                                <span className="font-medium text-[#497493]">Base Sepolia ETH</span>. You can get some from
                                these faucets or request it in our{' '}
                                <Link
                                    to="https://discord.com/invite/ratio1ai"
                                    target="_blank"
                                    className="font-medium text-[#5865F2] transition-all hover:opacity-50"
                                >
                                    Discord channel
                                </Link>
                                .
                            </div>

                            <div className="row gap-3">
                                <Link to="https://www.alchemy.com/faucets/base-sepolia" target="_blank">
                                    <img
                                        src={Alchemy}
                                        alt="Alchemy"
                                        className="h-8 w-8 rounded-full transition-all hover:opacity-50"
                                    />
                                </Link>

                                <Link to="https://portal.cdp.coinbase.com/products/faucet" target="_blank">
                                    <img
                                        src={Coinbase}
                                        alt="Coinbase"
                                        className="h-8 w-8 rounded-full transition-all hover:opacity-50"
                                    />
                                </Link>

                                <Link to="https://console.optimism.io/faucet" target="_blank">
                                    <img
                                        src={Optimism}
                                        alt="Optimism"
                                        className="h-8 w-8 rounded-full transition-all hover:opacity-50"
                                    />
                                </Link>

                                <Link to="https://thirdweb.com/base-sepolia-testnet" target="_blank">
                                    <img
                                        src={Thirdweb}
                                        alt="Thirdweb"
                                        className="h-8 w-8 rounded-full bg-purple-300 transition-all hover:opacity-50"
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </BigCard>
            </div>
        </div>
    );
}

export default Faucet;
