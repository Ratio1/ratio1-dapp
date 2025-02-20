import { ERC20Abi } from '@blockchain/ERC20';
import { UniswapV2RouterAbi } from '@blockchain/UniswapV2Router';
import { ChangeSlippageModal } from '@components/ChangeSlippageModal';
import { config } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/modal';
import { BigCard } from '@shared/BigCard';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiArrowDownLine, RiSettings2Line } from 'react-icons/ri';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import R1Logo from '@assets/token.svg';

function BuyR1() {
    const { watchTx, fetchR1Balance, fetchErc20Balance } = useBlockchainContext() as BlockchainContextType;
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const [selectedTokenId, setSelectedTokenId] = useState<string>(Object.keys(config.swapTokensDetails)[0]);
    const selectedToken = useMemo(() => config.swapTokensDetails[selectedTokenId], [selectedTokenId]);
    const [fromAmount, setFromAmount] = useState<string>(selectedToken.symbol);
    const [r1Estimate, setR1Estimate] = useState<string>('0');
    const [expectedPrice, setExpectedPrice] = useState<number>(0);
    const [userTokenBalance, setUserTokenBalance] = useState<bigint>(0n);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const hasSufficientBalance = useMemo(() => {
        return userTokenBalance >= parseUnits(fromAmount, selectedToken.decimals);
    }, [userTokenBalance, fromAmount]);

    const [slippageValue, setSlippageValue] = useState<string>('');
    const [slippage, setSlippage] = useState<number>(5);
    const { isOpen, onOpen, onClose: onCloseSlippageModal, onOpenChange } = useDisclosure();

    const minAmountOut = useMemo(() => {
        const slippageValue = Math.floor(slippage * 100) / 100; // Rounds down to 2 decimal places
        return (parseUnits(r1Estimate, 18) * BigInt(Math.floor(100 - slippageValue))) / 100n;
    }, [r1Estimate, slippage]);

    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();
    const publicClient = usePublicClient();

    const fetchEstimatedR1 = async () => {
        if (Number(fromAmount) === 0) {
            setR1Estimate('0');
            setExpectedPrice(0);
            return;
        }
        if (!publicClient) return;

        try {
            const amountsOut = await publicClient.readContract({
                address: config.uniswapV2RouterAddress,
                abi: UniswapV2RouterAbi,
                functionName: 'getAmountsOut',
                args: [parseUnits(fromAmount, selectedToken.decimals), selectedToken.swapPath],
            });

            const estimatedR1 = formatUnits(amountsOut[amountsOut.length - 1], 18);
            setR1Estimate(estimatedR1);
            setExpectedPrice(parseFloat(fromAmount) / parseFloat(estimatedR1));
        } catch (error) {
            toast.error('Unexpected error, please try again.');
            console.error(error);
            setR1Estimate('0');
            setExpectedPrice(0);
        }
    };

    const fetchUserBalance = () => {
        setUserTokenBalance(0n);

        if (selectedToken.address) {
            fetchErc20Balance(selectedToken.address).then(setUserTokenBalance);
        } else {
            if (!publicClient || !address) return;
            publicClient.getBalance({ address }).then(setUserTokenBalance);
        }
    };

    useEffect(() => {
        fetchEstimatedR1();
    }, [fromAmount, selectedToken]);

    useEffect(() => {
        fetchUserBalance();
    }, [address, selectedToken]);

    const swapForR1 = async () => {
        if (!walletClient || !address) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        try {
            setIsLoading(true);

            const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes
            const amountIn = parseUnits(fromAmount, selectedToken.decimals);

            if (selectedToken.address) {
                //TODO modal for two transactions?
                const approveTxHash = await walletClient.writeContract({
                    address: selectedToken.address,
                    abi: ERC20Abi,
                    functionName: 'approve',
                    args: [config.uniswapV2RouterAddress, amountIn],
                });

                await watchTx(approveTxHash, publicClient);

                const swapTxHash = await walletClient.writeContract({
                    address: config.uniswapV2RouterAddress,
                    abi: UniswapV2RouterAbi,
                    functionName: 'swapExactTokensForTokens',
                    args: [amountIn, minAmountOut, selectedToken.swapPath, address, BigInt(deadline)],
                });

                await watchTx(swapTxHash, publicClient);
            } else {
                const txHash = await walletClient.writeContract({
                    address: config.uniswapV2RouterAddress,
                    abi: UniswapV2RouterAbi,
                    functionName: 'swapExactETHForTokens',
                    args: [minAmountOut, selectedToken.swapPath, address, BigInt(deadline)],
                    value: amountIn,
                });
                await watchTx(txHash, publicClient);
            }

            fetchR1Balance();
            fetchUserBalance();
            fetchEstimatedR1();
        } catch (error) {
            toast.error('Unexpected error, please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="center-all w-full flex-col">
            <div className="w-full sm:w-auto">
                <BigCard fullWidth>
                    <div className="text-xl font-bold lg:text-2xl">Buy $R1 tokens</div>

                    <div className="col w-full gap-4 p-6 sm:min-w-[320px] md:w-[480px] lg:p-7">
                        {/*TODO show error message if user doesn't have enough balance*/}
                        <div className="col w-full gap-2 rounded-lg border bg-white p-4">
                            <label className="text-sm text-gray-500">You pay</label>
                            <div className="row items-center justify-between">
                                <input
                                    type="number"
                                    value={fromAmount}
                                    onChange={(e) => setFromAmount(e.target.value)}
                                    className="w-full border-none bg-transparent text-2xl font-semibold focus:outline-none"
                                />
                                {/*TODO maybe use a modal?*/}
                                <select
                                    value={selectedTokenId}
                                    onChange={(e) => {
                                        setSelectedTokenId(e.target.value);
                                        setFromAmount(config.swapTokensDetails[e.target.value].symbol);
                                    }}
                                    className="bg-transparent text-base font-medium focus:outline-none"
                                >
                                    {Object.keys(config.swapTokensDetails).map((key) => (
                                        <option key={key} value={key}>
                                            {key}
                                        </option>
                                    ))}
                                </select>
                                <img src={selectedToken.logo} alt={selectedTokenId} className="h-8 w-8" />
                            </div>
                            <div className="text-sm text-gray-500">
                                Balance:{' '}
                                {parseFloat(formatUnits(userTokenBalance, selectedToken.decimals)).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: selectedToken.displayDecimals,
                                })}{' '}
                                {selectedTokenId}
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <RiArrowDownLine className="text-3xl text-gray-500" />
                        </div>

                        <div className="col w-full gap-2 rounded-lg border bg-white p-4">
                            <label className="text-sm text-gray-500">You receive</label>
                            <div className="row items-center justify-between">
                                <span className="text-2xl font-semibold">
                                    {parseFloat(Number(r1Estimate).toFixed(2)).toLocaleString('en-US')}
                                </span>
                                <img src={R1Logo} alt="R1" className="h-8 w-8" />
                            </div>
                        </div>

                        <ConnectWalletWrapper>
                            <Button
                                color="primary"
                                fullWidth
                                onPress={swapForR1}
                                isLoading={isLoading}
                                isDisabled={isLoading || !authenticated || !fromAmount || !hasSufficientBalance}
                            >
                                {hasSufficientBalance ? 'Buy' : 'Insufficient balance'}
                            </Button>
                        </ConnectWalletWrapper>

                        <div className="col gap-2 text-sm font-medium">
                            <div className="text-base text-slate-400">Breakdown</div>

                            <div className="col gap-2">
                                <div className="row justify-between">
                                    <div>Expected price</div>
                                    <div>
                                        1 R1 ={' '}
                                        {expectedPrice.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: selectedToken.displayDecimals,
                                        })}{' '}
                                        {selectedTokenId}
                                    </div>
                                </div>

                                <div className="row justify-between">
                                    <div>Slippage</div>

                                    <div className="row gap-1">
                                        <div>{slippage}%</div>
                                        <RiSettings2Line
                                            className="cursor-pointer text-lg text-slate-400 transition-all hover:opacity-50"
                                            onClick={onOpen}
                                        />
                                    </div>
                                </div>

                                <div className="row justify-between">
                                    <div>Minimum Received</div>
                                    <div>
                                        {parseFloat(Number(formatUnits(minAmountOut, 18)).toFixed(2)).toLocaleString('en-US')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </BigCard>
            </div>

            <ChangeSlippageModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onClose={onCloseSlippageModal}
                slippageValue={slippageValue}
                setSlippageValue={setSlippageValue}
                slippage={slippage}
                setSlippage={setSlippage}
            />
        </div>
    );
}

export default BuyR1;
